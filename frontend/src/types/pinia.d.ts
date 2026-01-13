import "pinia";
import type { AuthState } from "../../modules/auth/auth.store";

declare module "pinia" {
  export interface PiniaCustomProperties {
    $auth: {
      accessToken: AuthState["accessToken"];
      refreshToken: AuthState["refreshToken"];
      permissions: AuthState["permissions"];
    };
  }
}
