# Time-based One-Time Password (TOTP) Authentication

TOTP is a popular method of implementing Two-Factor Authentication (2FA) that generates a one-time password based on the current time.

## Steps:

1. **Secret Key Generation**: A unique secret key is generated for each user during the setup process. This secret key is known only to the user and the authentication system.

2. **Initial Configuration**: The user configures their authentication device, such as a smartphone or authentication app, with the secret key.

3. **Time-Based Generation**: When the user attempts to log in, the authentication system generates a one-time password based on the current time and the shared secret key. The current time is typically divided into time intervals, often 30 seconds.

4. **Algorithm Calculation**: The one-time password is calculated using a cryptographic algorithm, usually HMAC-SHA1, which combines the current time interval with the secret key. This calculation ensures that the generated password is unpredictable and unique for each time interval.

5. **User Input**: The authentication system prompts the user to enter the one-time password generated by their authentication device.

6. **Validation**: The authentication system independently calculates the one-time password using the current time and the secret key associated with the user's account. If the entered password matches the calculated password, the user is successfully authenticated.

7. **Expiration**: After a time interval (e.g., 30 seconds), the one-time password becomes invalid, and a new password must be generated for the next time interval.

By using TOTP, the authentication process becomes more secure as the one-time passwords are valid only for a short period and are generated based on a shared secret key and the current time, making them resistant to replay attacks and interception.

<img src="https://github.com/arshkkk/Authenticator-App/assets/58404935/c43c5394-c77f-4e04-a7eb-9b4d068a1f9c" height="600"/>

<img src="https://github.com/arshkkk/Authenticator-App/assets/58404935/66c5c0d0-cd9d-4171-ab9c-8ad0ac978620" height="600"/>
<img src="https://github.com/arshkkk/Authenticator-App/assets/58404935/89c431ee-b3d8-4f66-9f66-e000994756eb" height="600"/>
<img src="https://github.com/arshkkk/Authenticator-App/assets/58404935/27cf8e81-a8e9-4f71-8bcd-23bbc640c216" height="600"/>
