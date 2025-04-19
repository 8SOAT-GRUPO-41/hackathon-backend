import { JwtTokenService } from "../services/jwt-token-service";

export const makeJwtTokenService = () => {
  const jwtSecret =
    process.env.JWT_SECRET || "default_jwt_secret_key_for_development";
  return new JwtTokenService(jwtSecret);
};
