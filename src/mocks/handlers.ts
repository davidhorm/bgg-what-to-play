import { rest } from "msw";

const response202 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<message>Your request for this collection has been accepted and will be processed.  Please try again later for access.</message>`;

const response000 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?><items totalitems="0" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse" pubdate="Sun, 12 Feb 2023 17:02:51 +0000"></items>`;

const response001 = `<?xml version="1.0" encoding="utf-8" standalone="yes"?><items totalitems="1" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse" pubdate="Sun, 12 Feb 2023 17:02:51 +0000">
<item objecttype="thing" objectid="9209" subtype="boardgame" collid="16613980">
  <name sortindex="1">Ticket to Ride</name>
  <status own="1" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="0" wishlist="0"  preordered="0" lastmodified="2021-02-07 13:46:15" />
  <stats minplayers="2" maxplayers="5" minplaytime="30" maxplaytime="60" playingtime="60" numowned="118911">
    <rating value="9.5">
      <usersrated value="83630" />
      <average value="7.3991" />
      <bayesaverage value="7.28624" />
      <stddev value="1.29921" />
      <median value="0" />
      <ranks>
        <rank type="subtype" id="1" name="boardgame" friendlyname="Board Game Rank" value="211" bayesaverage="7.28624" />
        <rank type="family" id="5499" name="familygames" friendlyname="Family Game Rank" value="49" bayesaverage="7.28517" />
      </ranks>
    </rating>
  </stats>
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
