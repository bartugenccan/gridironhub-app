import { BaseResponse } from '../common';

export interface RegisterTokenRequest {
  token: string;
}

export interface RegisterTokenResponse extends BaseResponse {
  data: {
    success: boolean;
  };
}
