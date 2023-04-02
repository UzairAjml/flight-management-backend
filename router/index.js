var express = require("express");
var router = express.Router();
var { DuffelError } = require("@duffel/api");
var duffel = require("../duffel");

router.post("/search", async (req, res) => {
  const { origin, destination, sort, cabin_class, departure_date, passengers } =
    req.body;
  if (!origin || !destination) {
    res.sendStatus(422);
    return;
  }
  try {
    // create an offer request for a flight departing tomorrow
    const offerRequestsResponse = await duffel.offerRequests.create({
      slices: [
        {
          origin,
          destination,
          departure_date,
        },
      ],
      passengers: [...passengers],
      cabin_class,
      return_offers: false,
    });

    // retrieve the cheapest offer
    const offersResponse = await duffel.offers.list({
      offer_request_id: offerRequestsResponse.data.id,
      sort: "total_amount",
      limit: 1,
    });

    res.send({
      offer: offersResponse.data[0],
    });
  } catch (e) {
    console.error(e);
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors });
      return;
    }
    res.status(500).send(e);
  }
});
module.exports = router;
