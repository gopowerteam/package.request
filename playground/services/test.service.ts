import { RequestService } from "@gopowerteam/request";

export class TestService {
  test({ a: number }, ...plugins) {
    return RequestService.send({
      url: "",
      method: "POST",
      query: {},
      body: {},
    });
  }
}
