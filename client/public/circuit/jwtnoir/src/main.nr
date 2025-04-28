use jwt::JWT;

global MAX_DATA_LENGTH: u32 = 1024; // max length of signed data (headerb64 + "." + payloadb64)
//global MAX_NONCE_LENGTH: u32 = 32; // we are verifying `nonce` claim
//global MAX_EMAIL_LENGTH: u32 = 32; // max length for email claim
//global MAX_KEY_LENGTH: u32 = 5; // max length for claim keys

fn main(
    data: BoundedVec<u8, MAX_DATA_LENGTH>,
    base64_decode_offset: u32,
    pubkey_modulus_limbs: pub [u128; 18],
    redc_params_limbs: [u128; 18],
    signature_limbs: [u128; 18],
    //expected_nonce: pub BoundedVec<u8, MAX_NONCE_LENGTH>
) {
    let jwt = JWT::init(
        data,
        base64_decode_offset,
        pubkey_modulus_limbs,
        redc_params_limbs,
        signature_limbs,
    );

    jwt.verify();


    //let email = jwt.get_claim_string::<MAX_KEY_LENGTH, MAX_EMAIL_LENGTH>("email".as_bytes());
    //println(f"email: {email}");
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
}