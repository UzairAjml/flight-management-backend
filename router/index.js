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
    console.log("return_offer",return_offer)
    const slice = return_offer
      ? [
          {
            origin,
            destination,
            departure_date,
          },
          {
            origin:destination,
            destination:origin,
            departure_date: return_date,
          },
        ]
      : [
          {
            origin,
            destination,
            departure_date,
          },
        ];

    const offerRequestsResponse = await duffel.offerRequests.create({
      slices: [...slice],
      passengers: [...passengers],
      cabin_class,
      // requestedSources:["duffel_airways"],
      // return_offers: !return_offer,
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

//List Airlines

router.get("/getAirlines", async (req, res) => {
  try {
    const airlines = await duffel.airlines.list({
      limit: 50,
    });

    res.send({
      offer: airlines,
    });
  } catch (e) {
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
      // sort: "total_amount",
      // limit: 50,
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
//create payment intent
router.post("/paymentIntent", async (req, res) => {
  const { total_amount, total_currency } = req.body;
  try {
    const offersResponse = await duffel.paymentIntents.create({
      currency: total_currency,
      amount: total_amount,
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

//confirm payment
router.get("/confirm-payment/:id", async (req, res) => {
  if (!req.params["id"]) {
    res.sendStatus(422);
    return;
  }
  try {
    const offersResponse = await duffel.paymentIntents.confirm(
      req.params["id"]
    );
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

//create order
router.post("/create-order", async (req, res) => {
  try {
    const offersResponse = await duffel.orders.create({
      ...req.body,
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
