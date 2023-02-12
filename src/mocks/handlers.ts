import { rest } from "msw";

const response202 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<message>Your request for this collection has been accepted and will be processed.  Please try again later for access.</message>`;

const response000 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?><items totalitems="0" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse" pubdate="Sun, 12 Feb 2023 17:02:51 +0000"></items>`;

export const handlers = [
  rest.get("https://bgg.cc/xmlapi2/collection", (req, res, ctx) => {
    const username = req.url.searchParams.get("username");

    if (username === "202") {
      console.info("Mocking response for 202");
      return res(ctx.status(202), ctx.xml(response202));
    } else if (username === "000") {
      console.info("Mocking response for empty collection");
      return res(ctx.status(200), ctx.xml(response000));
    }

    return req.passthrough();
  }),
];
