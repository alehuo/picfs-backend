process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "HelloWorld";

import * as Knex from "knex";
import "mocha";
import * as Database from "../../src/Database";
import app from "../../src/index";

import { SignToken } from "../../src/utils/JwtUtils";

const validUser: any = {
  userId: 1,
  email: "testuser@email.com",
  firstName: "Test",
  lastName: "User",
  unionId: 1,
  permissions: 67108863
};

const generateToken: (userData?: any) => string = (userData?: any): string => {
  if (userData) {
    return "Bearer " + SignToken(Object.assign({}, validUser, userData));
  } else {
    return "Bearer " + SignToken(validUser);
  }
};

const knex: Knex = Database.connect();
const chai: Chai.ChaiStatic = require("chai");
const should: Chai.Should = chai.should();
const chaiHttp: Chai.ChaiHttpRequest = require("chai-http");
chai.use(chaiHttp);

const url: string = "/api/v1/watch";

describe("WatchController", () => {
  // Roll back
  beforeEach((done: Mocha.Done) => {
    knex.migrate.rollback().then(() => {
      knex.migrate.latest().then(() => {
        knex.seed.run().then(() => {
          done();
        });
      });
    });
  });

  // After each
  afterEach((done: Mocha.Done) => {
    knex.migrate.rollback().then(() => {
      done();
    });
  });

  describe("API endpoint protection", () => {
    it("Missing Authorization header should throw an error", (done: Mocha.Done) => {
      chai
        .request(app)
        .get(url + "/ongoing")
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(403);
          should.exist(res.body.error);
          res.body.error.should.equal("Missing Authorization header");
          done();
        });
    });

    it("Malformed Authorization header should throw an error", (done: Mocha.Done) => {
      chai
        .request(app)
        .get(url + "/ongoing")
        .set("Authorization", "Bearer HelloWorld")
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(403);
          should.exist(res.body.error);
          res.body.error.should.equal("Malformed Authorization header");
          done();
        });
    });
  });

  describe("GET /api/v1/watch/ongoing", () => {
    it("Returns all ongoing watches", (done: Mocha.Done) => {
      chai
        .request(app)
        .get(url + "/ongoing")
        .set("Authorization", generateToken())
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(200);
          res.body.length.should.equal(1);
          res.body[0].watchId.should.equal(2);
          res.body[0].userId.should.equal(1);
          res.body[0].startMessage.should.equal(
            "Good evening, I'm taking responsibility of a few exchange students."
          );
          should.not.exist(res.body[0].endMessage);
          should.exist(res.body[0].startTime);
          should.not.exist(res.body[0].endTime);
          done();
        });
    });
  });

  describe("GET /api/v1/watch/user/:userId", () => {
    it("Returns watches (old and ongoing) by a single user", (done: Mocha.Done) => {
      chai
        .request(app)
        .get(url + "/user/1")
        .set("Authorization", generateToken())
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(200);
          should.not.exist(res.body.error);
          res.body.length.should.equal(2);

          // First
          res.body[0].watchId.should.equal(1);
          res.body[0].userId.should.equal(1);
          res.body[0].startMessage.should.equal(
            "Let's get this party started."
          );
          res.body[0].endMessage.should.equal(
            "I have left the building. Moved people under my supervision to another keyholder."
          );
          should.exist(res.body[0].startTime);
          should.exist(res.body[0].endTime);

          // Second
          res.body[1].watchId.should.equal(2);
          res.body[1].userId.should.equal(1);
          res.body[1].startMessage.should.equal(
            "Good evening, I'm taking responsibility of a few exchange students."
          );
          should.not.exist(res.body[1].endMessage);
          should.exist(res.body[1].startTime);
          res.body[1].startTime.should.equal(
            new Date(2018, 6, 1, 23, 58).toISOString()
          );
          should.not.exist(res.body[1].endTime);

          done();
        });
    });
  });

  describe("GET /api/v1/watch/ongoing/user/:userId", () => {
    it("Returns all ongoing watches by a single user.", (done: Mocha.Done) => {
      chai
        .request(app)
        .get(url + "/ongoing/user/1")
        .set("Authorization", generateToken())
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(200);
          should.not.exist(res.body.error);
          res.body.length.should.equal(1);

          // First
          res.body[0].watchId.should.equal(2);
          res.body[0].userId.should.equal(1);
          res.body[0].startMessage.should.equal(
            "Good evening, I'm taking responsibility of a few exchange students."
          );
          should.not.exist(res.body[0].endMessage);
          should.exist(res.body[0].startTime);
          should.not.exist(res.body[0].endTime);

          done();
        });
    });
  });

  describe("POST /api/v1/watch/start & POST /api/v1/watch/stop", () => {
    it("User can start and stop a watch.", (done: Mocha.Done) => {
      // Start the watch
      chai
        .request(app)
        .post(url + "/start")
        .set("Authorization", generateToken({ userId: 2 }))
        .send({ startMessage: "Let's rock and roll!" })
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(201);
          should.not.exist(res.body.error);
          should.exist(res.body.message);
          res.body.message.should.equal("Watch started");
          // Stop the watch
          chai
            .request(app)
            .post(url + "/stop")
            .set("Authorization", generateToken({ userId: 2 }))
            .send({ endMessage: "Good night all!" })
            .end((err2: any, res2: ChaiHttp.Response) => {
              res2.status.should.equal(200);
              should.not.exist(res2.body.error);
              should.exist(res2.body.message);
              res2.body.message.should.equal(
                "Watch ended with message 'Good night all!'"
              );
              done();
            });
        });
    });

    it("User can not start a watch if he/she already has an ongoing watch.", (done: Mocha.Done) => {
      chai
        .request(app)
        .post(url + "/start")
        .set("Authorization", generateToken())
        .send({ startMessage: "Let's rock and roll!" })
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(400);
          should.exist(res.body.error);
          should.not.exist(res.body.message);
          res.body.error.should.equal("You already have an ongoing watch");
          done();
        });
    });

    it("User can not stop a watch if he/she doesn't have an ongoing watch.", (done: Mocha.Done) => {
      chai
        .request(app)
        .post(url + "/stop")
        .set("Authorization", generateToken({ userId: 2 }))
        .send({ endMessage: "Let's rock and roll!" })
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(400);
          should.exist(res.body.error);
          should.not.exist(res.body.message);
          res.body.error.should.equal("You don't have an ongoing watch.");
          done();
        });
    });

    it("User can not start a watch with missing request parameters.", (done: Mocha.Done) => {
      chai
        .request(app)
        .post(url + "/start")
        .set("Authorization", generateToken({ userId: 2 }))
        .send({ test: "Let's rock and roll!" })
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(400);
          should.exist(res.body.error);
          should.not.exist(res.body.message);
          res.body.error.should.equal("Missing request body parameters");
          should.exist(res.body.errors);
          res.body.errors.length.should.equal(1);
          res.body.errors[0].should.equal("Missing: startMessage");
          done();
        });
    });

    it("User can not stop a watch with missing request parameters.", (done: Mocha.Done) => {
      chai
        .request(app)
        .post(url + "/stop")
        .set("Authorization", generateToken({ userId: 2 }))
        .send({ test: "Let's rock and roll!" })
        .end((err: any, res: ChaiHttp.Response) => {
          res.status.should.equal(400);
          should.exist(res.body.error);
          should.not.exist(res.body.message);
          res.body.error.should.equal("Missing request body parameters");
          should.exist(res.body.errors);
          res.body.errors.length.should.equal(1);
          res.body.errors[0].should.equal("Missing: endMessage");
          done();
        });
    });
  });
});