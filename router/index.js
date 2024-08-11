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
    rangeValues,
  } = req.body;
  if (!origin || !destination) {
    res.sendStatus(422);
    return;
  }
  let slice;
  try {
    // create an offer request for a flight departing tomorrow
    slice = return_offer
      ? [
          {
            origin,
            destination,
            departure_date,
            // departure_time: {
            //   to: `${
            //     rangeValues?.from_departure[1] > 9
            //       ? rangeValues?.from_departure[1]
            //       : `0${
            //           isNaN(rangeValues?.from_departure[1])
            //             ? "0"
            //             : rangeValues?.from_departure[1]
            //         }`
            //   }:00`,
            //   from: `${
            //     rangeValues?.from_departure[0] > 9
            //       ? rangeValues?.from_departure[0]
            //       : `0${
            //           isNaN(rangeValues?.from_departure[0])
            //             ? "0"
            //             : rangeValues?.from_departure[0]
            //         }`
            //   }:00`,
            // },
            // arrival_time: {
            //   to: `${
            //     rangeValues?.to_departure[1] > 9
            //       ? rangeValues?.to_departure[1]
            //       : `0${
            //           isNaN(rangeValues?.to_departure[1])
            //             ? "0"
            //             : rangeValues?.to_departure[1]
            //         }`
            //   }:00`,
            //   from: `${
            //     rangeValues?.to_departure[0] > 9
            //       ? rangeValues?.to_departure[0]
            //       : `0${
            //           isNaN(rangeValues?.to_departure[0])
            //             ? "0"
            //             : rangeValues?.to_departure[0]
            //         }`
            //   }:00`,
            // },
          },
          {
            origin: destination,
            destination: origin,
            departure_date: return_date,
            // departure_time: {
            //   to: `${
            //     rangeValues?.from_arrival[1] > 9
            //       ? rangeValues?.from_arrival[1]
            //       : `0${
            //           isNaN(rangeValues?.from_arrival[1])
            //             ? "0"
            //             : rangeValues?.from_arrival[1]
            //         }`
            //   }:00`,
            //   from: `${
            //     rangeValues?.from_arrival[0] > 9
            //       ? rangeValues?.from_arrival[0]
            //       : `0${
            //           isNaN(rangeValues?.from_arrival[0])
            //             ? "0"
            //             : rangeValues?.from_arrival[0]
            //         }`
            //   }:00`,
            // },
            // arrival_time: {
            //   to: `${
            //     rangeValues?.to_arrival[1] > 9
            //       ? rangeValues?.to_arrival[1]
            //       : `0${
            //           isNaN(rangeValues?.to_arrival[1])
            //             ? "0"
            //             : rangeValues?.to_arrival[1]
            //         }`
            //   }:00`,
            //   from: `${
            //     rangeValues?.to_arrival[0] > 9
            //       ? rangeValues?.to_arrival[0]
            //       : `0${
            //           isNaN(rangeValues?.to_arrival[0])
            //             ? "0"
            //             : rangeValues?.to_arrival[0]
            //         }`
            //   }:00`,
            // },
          },
        ]
      : [
          {
            origin,
            destination,
            departure_date,
            // departure_time: {
            //   to: `${
            //     rangeValues?.from_departure[1] > 9
            //       ? rangeValues?.from_departure[1]
            //       : `0${
            //           isNaN(rangeValues?.from_departure[1])
            //             ? "0"
            //             : rangeValues?.from_departure[1]
            //         }`
            //   }:00`,
            //   from: `${
            //     rangeValues?.from_departure[0] > 9
            //       ? rangeValues?.from_departure[0]
            //       : `0${
            //           isNaN(rangeValues?.from_departure[0])
            //             ? "0"
            //             : rangeValues?.from_departure[0]
            //         }`
            //   }:00`,
            // },
            // arrival_time: {
            //   to: `${
            //     rangeValues?.to_departure[1] > 9
            //       ? rangeValues?.to_departure[1]
            //       : `0${
            //           isNaN(rangeValues?.to_departure[1])
            //             ? "0"
            //             : rangeValues?.to_departure[1]
            //         }`
            //   }:00`,
            //   from: `${
            //     rangeValues?.to_departure[0] > 9
            //       ? rangeValues?.to_departure[0]
            //       : `0${
            //           isNaN(rangeValues?.to_departure[0])
            //             ? "0"
            //             : rangeValues?.to_departure[0]
            //         }`
            //   }:00`,
            // },
          },
        ];

    const offerRequestsResponse = await duffel.offerRequests.create({
      slices: [...slice],
      passengers: [...passengers],
      cabin_class,
      max_connections: 2,
      // requestedSources:["duffel_airways"],
      return_offers: !return_offer,
    });
    res.send({
      offer: offerRequestsResponse.data,
    });
  } catch (e) {
    console.error(e);
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors, data: slice });
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
    const payload = req.query?.after
      ? {
          offer_request_id: req.params["id"],
          sort: "total_amount",
          limit: 20,
        }
      : req.query?.before
      ? {
          offer_request_id: req.params["id"],
          sort: "total_amount",
          limit: 20,
          before: req.query?.before,
        }
      : {
          offer_request_id: req.params["id"],
          sort: "total_amount",
          limit: 20,
          after: req.query?.after,
        };
        console.log("payload",payload)
    const offersResponse = await duffel.offers.list(payload);

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
      offer: offersResponse.data,
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