use std::hash::poseidon2;

fn main(guess: [Field; 6]) -> pub Field {
    let guess_hash = poseidon2::Poseidon2::hash(guess, 6);
    guess_hash
}

