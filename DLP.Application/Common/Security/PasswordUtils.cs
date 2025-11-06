namespace DLP.Application.Common.Security;
public class PasswordUtils
{
    public static string GenerateOTP(int length = 6)
    {
        const int minCharTypes = 6;

        if (length < minCharTypes)
        {
            throw new ArgumentException($"Length should be greater than or equal to {minCharTypes}.");
        }

        string characters = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%*";

        string otp = string.Empty;
        Random random = new();

        for (int i = 0; i < length; i++)
        {
            string character;
            do
            {
                int index = random.Next(0, characters.Length);
                character = characters[index].ToString();
            } while (otp.IndexOf(character) != -1);

            otp += character;
        }

        return otp;
    }
}
