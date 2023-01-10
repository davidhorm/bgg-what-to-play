import { rest } from "msw";

const response202 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<message>Your request for this collection has been accepted and will be processed.  Please try again later for access.</message>`;

export const handlers = [
  rest.get("https://bgg.cc/xmlapi2/collection", (req, res, ctx) => {
    const username = req.url.searchParams.get("username");

    if (username === "202") {
      console.info("Mocking response for 202");
      return res(ctx.status(202), ctx.xml(response202));
    }

    return req.passthrough();
  }),
];
