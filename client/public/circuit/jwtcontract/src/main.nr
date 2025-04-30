use dep::aztec::macros::aztec;

#[aztec]
contract jwtVotingQuest {
    use dep::aztec::{
        //keys::getters::get_public_keys,
        macros::{functions::{initializer, internal, private, public, utility}, storage::storage},
    };
    use dep::aztec::prelude::{AztecAddress, Map, PublicImmutable, PublicMutable};
    use dep::aztec::protocol_types::traits::{Hash, ToField};
    use jwt::JWT;

    global MAX_DATA_LENGTH: u32 = 1024; // max length of signed data (headerb64 + "." + payloadb64)
    global MAX_EMAIL_LENGTH: u32 = 32; // max length for email claim
    global MAX_KEY_LENGTH: u32 = 5; // max length for claim keys

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
        data: BoundedVec<u8, MAX_DATA_LENGTH>,
        base64_decode_offset: u32,
        pubkey_modulus_limbs: pub [u128; 18],
        redc_params_limbs: [u128; 18],
        signature_limbs: [u128; 18],
        identifier: Field,
        candidate: Field
    ) {
        let email_hash = jwtVotingQuest::at(context.this_address()).verify_jwt(
            data,
            base64_decode_offset,
            pubkey_modulus_limbs,
            redc_params_limbs,
            signature_limbs
        );
        
        // Use the email hash for the nullifier
        context.push_nullifier(email_hash );
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
    unconstrained fn get_description() -> String {
        "Voting quest: You have to get ${storage.quest_objective.read()} votes gain the quest"
    }

    #[public]
    fn end_vote() {
        assert(storage.admin.read().eq(context.msg_sender()), "Only admin can end votes"); // assert that caller is admin
        storage.vote_ended.write(true);
    }

    #[public]
    #[internal]
    fn verify_jwt(
        data: BoundedVec<u8, MAX_DATA_LENGTH>,
        base64_decode_offset: u32,
        pubkey_modulus_limbs: [u128; 18],
        redc_params_limbs: [u128; 18],
        signature_limbs: [u128; 18]
    ) -> Field {
        let jwt = JWT::init(
            data,
            base64_decode_offset,
            pubkey_modulus_limbs,
            redc_params_limbs,
            signature_limbs,
        );

        jwt.verify();

        // Verify `email_verified` claim value is true
        jwt.assert_claim_bool(
            "email_verified".as_bytes(), 
            true
            );

        // Verify `iss` (issuer) claim value is "https://accounts.google.com"
        jwt.assert_claim_string(
            "iss".as_bytes(), 
            BoundedVec::<u8, 32>::from_array("https://accounts.google.com".as_bytes())
            );

        // Get the email and hash it to return as a Field
        let email = jwt.get_claim_string::<MAX_KEY_LENGTH, MAX_EMAIL_LENGTH>("email".as_bytes());
        
        // Convert email string to Field for hashing
        // Create a hashed representation by using pedersen_hash on the raw bytes
        let mut email_bytes = [0 as Field; MAX_EMAIL_LENGTH];
        
        // Copy the available bytes from the email to our array (up to 32 bytes)
        let email_len = email.len();
        let copy_length = if email_len < 32 { email_len } else { 32 };
        
        for i in 0..copy_length {
            email_bytes[i] = email[i] as Field;
        }
        
        // Hash the bytes to get a Field value
        std::hash::pedersen_hash(email_bytes)
    }
}

