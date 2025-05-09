use std::hash::poseidon2;

fn main(guess: [Field; 6], expected_hash: pub Field) {
    let guess_hash = poseidon2::Poseidon2::hash(guess, 6);
    assert(guess_hash == expected_hash);
}

#[test]
fn test_main() {
    let guess = [84, 73, 69, 77, 80, 79];
    let expected_hash = 0x26a9cd878299aae15aa2e27d41fab958fbe7f0730d81e834c5315bdbf3eecb04;

    println(poseidon2::Poseidon2::hash(guess, guess.len()));

    main(guess, expected_hash);
}

#[test(should_fail)]
fn test_fail() {
    let guess = [84, 73, 69, 77, 80, 79];
    let expected_hash = 0x168758332d5b3e2d13be8048c8011b454590e06c44bce7f702f09103eef5a373;

    main(guess, expected_hash);
}
