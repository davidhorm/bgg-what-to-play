import { rest } from "msw";

const response202 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<message>Your request for this collection has been accepted and will be processed.  Please try again later for access.</message>`;

const response000 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?><items totalitems="0" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse" pubdate="Sun, 12 Feb 2023 17:02:51 +0000"></items>`;

const response001 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?><items totalitems="1" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse" pubdate="Sun, 12 Feb 2023 17:02:51 +0000">
<item objecttype="thing" objectid="9209" subtype="boardgame" collid="16613980">
  <name sortindex="1">Ticket to Ride</name>
  <status own="1" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="0" wishlist="0"  preordered="0" lastmodified="2021-02-07 13:46:15" />
</item>
</items>`;

export const handlers = [
  rest.get("https://bgg.cc/xmlapi2/collection", (req, res, ctx) => {
    const username = req.url.searchParams.get("username");

    if (username === "202") {
      console.info("Mocking response for 202");
      return res(ctx.status(202), ctx.xml(response202));
    } else if (username === "000") {
      console.info("Mocking response for empty collection");
      return res(ctx.status(200), ctx.xml(response000));
    } else if (username === "001") {
      console.info("Mocking response for a collection with a single game");
      return res(ctx.status(200), ctx.xml(response001));
    }

    return req.passthrough();
  }),
  rest.get("https://cf.geekdo-images.com/*", (req, res, ctx) =>
    req.passthrough()
  ),
];
