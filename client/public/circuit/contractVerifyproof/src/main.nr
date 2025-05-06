use dep::aztec::macros::aztec;

#[aztec]
contract jwtVotingQuest {
    use dep::aztec::{
        //keys::getters::get_public_keys,
        macros::{functions::{
            initializer, 
            internal, 
            private, 
            public, 
            utility
            }, storage::storage},
    };
    use dep::aztec::prelude::{AztecAddress, Map, PublicImmutable, PublicMutable};
    use dep::aztec::protocol_types::traits::{Hash, ToField};
    use dep::std;

    global MAX_DATA_LENGTH: u32 = 1024; // max length of signed data (headerb64 + "." + payloadb64)
    global MAX_EMAIL_LENGTH: u32 = 32; // max length for email claim
    global MAX_KEY_LENGTH: u32 = 5; // max length for claim keys
    // FIX: Failing if MAX_DESCRIPTION_LENGTH doesn't coincide with actual string length
    global MAX_DESCRIPTION_LENGTH: u32 = 65; // max length for description
    global HONK_VK_SIZE: u32 = 128;
    global HONK_PROOF_SIZE: u32 = 456;
    global HONK_IDENTIFIER: u32 = 1;

    #[storage]
    struct Storage<Context> {
        admin: PublicMutable<AztecAddress, Context>, // admin can end vote
        tally: Map<Field, PublicMutable<u32, Context>, Context>, // we will store candidate as key and number of votes as value
        quest_tally: Map<Field, PublicMutable<u32, Context>, Context>, // we will store the hash of the secret as key and number of votes as value
        vote_ended: PublicMutable<bool, Context>, // vote_ended is boolean
        active_at_block: PublicImmutable<u32, Context>, // when people can start voting
        quest_objective: PublicImmutable<u32, Context>, // quest objective
        quest_winner: PublicMutable<Field, Context>, // quest winner
    }

    #[public]
    #[initializer]
    // annotation to mark function as a constructor
    fn constructor(admin: AztecAddress, quest_objective: u32) {
        storage.admin.write(admin);
        storage.vote_ended.write(false);
        storage.active_at_block.initialize(context.block_number() as u32);
        storage.quest_objective.initialize(quest_objective);
    }

    #[private]
    // annotation to mark function as private and expose private context
    fn cast_vote(
        verification_key : [Field; HONK_VK_SIZE], 
        proof: [Field; HONK_PROOF_SIZE],// 93 ultraplonk | ultrahonk
        public_inputs : [Field; 18], // 18 public inputs for each quest
        identifier: Field,
        candidate: Field
    ) {
        jwtVotingQuest::at(context.this_address()).verify_jwt(
            verification_key,
            proof,
            public_inputs
        );
        
        // Use the email hash for the nullifier

        let nullifier = std::hash::pedersen_hash([context.msg_sender().to_field(), identifier]); // derive nullifier from sender and secret
        context.push_nullifier(nullifier );
        jwtVotingQuest::at(context.this_address()).add_to_tally_public(identifier, candidate).enqueue(
            &mut context,
        );
    }
    
    #[public]
    #[internal]
    fn add_to_tally_public(identifier: Field, candidate: Field) {
        assert(storage.vote_ended.read() == false, "Vote has ended"); // assert that vote has not ended
        let new_tally = storage.tally.at(candidate).read() + 1;
        storage.tally.at(candidate).write(new_tally);
        let new_quest_tally = storage.tally.at(identifier).read() + 1;
        storage.quest_tally.at(identifier).write(new_quest_tally);

        if new_quest_tally >= storage.quest_objective.read()  {
            storage.vote_ended.write(true);
            storage.quest_winner.write(identifier);
        }
    }

    #[utility]
    unconstrained fn get_vote(candidate: Field) -> u32 {
        storage.tally.at(candidate).read()
    }

    #[utility]
    unconstrained fn get_description() -> str<8> {
        let votes_needed = storage.quest_objective.read();   
        //f"Voting quest: You have to get {votes_needed} votes gain the quest")
        "HOLAHOLA"
    }

    #[public]
    fn end_vote() {
        assert(storage.admin.read().eq(context.msg_sender()), "Only admin can end votes"); // assert that caller is admin
        storage.vote_ended.write(true);
    }

    #[public]
    #[internal]
    fn verify_jwt(
        verification_key : [Field; HONK_VK_SIZE], 
        proof: [Field; HONK_PROOF_SIZE],// 93 ultraplonk | ultrahonk
        public_inputs : [Field; 18], // 18 public inputs for each quest
    ) {
        std::verify_proof_with_type(
                verification_key, 
                proof, 
                public_inputs, 
                0x0,
                HONK_IDENTIFIER
            );
    }
}

