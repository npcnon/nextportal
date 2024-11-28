import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/router';

const CLIENT_ID = "269047088646-920g0c1701fvs4hrvuvfb11aoe8eem6s.apps.googleusercontent.com"; // Replace with your client ID

const GoogleSignIn = ({ onSuccess, onFailure }) => {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin 
        onSuccess={onSuccess}
        onError={onFailure}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;
