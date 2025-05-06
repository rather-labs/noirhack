
use dep::std;

global HONK_VK_SIZE: u32 = 128;
global HONK_PROOF_SIZE: u32 = 456;
global HONK_IDENTIFIER: u32 = 1;

fn main(
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
