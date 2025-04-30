
use dep::std;

global quest_count: u32 = 1;

fn main(
    verification_keys : [[Field; 114]; quest_count],
    proofs: [[Field; 93]; quest_count],
    public_inputs : [[Field; 18]; quest_count], // 18 public inputs for each quest
    key_hash : [Field; quest_count]
) {
    verify_batch(verification_keys, proofs, public_inputs, key_hash);
}

fn verify_batch<
        let quest_count: u32, 
        let public_inputs_count: u32, 
        let proof_length: u32,  
        let verification_key_length: u32
    >(
    verification_keys : [[Field; verification_key_length]; quest_count],
    proofs: [[Field; proof_length]; quest_count],
    public_inputs : [[Field; public_inputs_count]; quest_count],
    key_hash : [Field; quest_count]
) {
    for i in 0..quest_count {
        std::verify_proof(
            verification_keys[i],
            proofs[i],
            public_inputs[i],
            key_hash[i]
        );
    }
}