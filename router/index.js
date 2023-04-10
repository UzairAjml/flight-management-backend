var express = require("express");
var router = express.Router();
var { DuffelError } = require("@duffel/api");
var duffel = require("../duffel");
//search offer API
router.post("/search", async (req, res) => {
  const {
    origin,
    destination,
    sort,
    cabin_class,
    departure_date,
    return_date,
    passengers,
    return_offer,
  } = req.body;
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
        {
          destination,
          origin,
          departure_date: return_date,
        },
      ],
      passengers: [...passengers],
      cabin_class,
      return_offers: return_offer,
    });
    res.send({
      offer_id: offerRequestsResponse.data.id,
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

//List offer API

router.get("/getOffers/:id", async (req, res) => {
  if (!req.params["id"]) {
    res.sendStatus(422);
    return;
  }
  try {
    const offersResponse = await duffel.offers.list({
      offer_request_id: req.params["id"],
      sort: "total_amount",
      limit: 10,
    });

    res.send({
      offer: offersResponse.data[0],
    });
  } catch (e) {
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors });
      return;
    }
    res.status(500).send(e);
  }
});
// seatPlan API
router.get("/getSeatPlan/:id", async (req, res) => {
  if (!req.params["id"]) {
    res.sendStatus(422);
    return;
  }
  try {
    const offersResponse = await duffel.seatMaps.get({
      offer_id: req.params["id"],
    });
    console.log("offersResponse", offersResponse);
    res.send({
      offer: offersResponse.data[0],
    });
  } catch (e) {
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors });
      return;
    }
    res.status(500).send(e);
  }
});
//single offer details
router.get("/getSingleOffer/:id", async (req, res) => {
  if (!req.params["id"]) {
    res.sendStatus(422);
    return;
  }
  try {
    const offersResponse = await duffel.offers.get(req.params["id"]);
    res.send({
      offer: offersResponse,
    });
  } catch (e) {
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors });
      return;
    }
    res.status(500).send(e);
  }
});
//search places api
router.get("/searchPlace/:query", async (req, res) => {
  if (!req.params["query"]) {
    res.sendStatus(422);
    return;
  }
  try {
    const offersResponse = await duffel.suggestions.list({
      query: req.params["query"],
    });
    res.send({
      offer: offersResponse,
    });
  } catch (e) {
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors });
      return;
    }
    res.status(500).send(e);
  }
});
module.exports = router;
