var c = require("../condensation");

describe("condensation", function() {
  it("fetches all amazon images", function(cb) {
    this.timeout(60000);
    c.initialize(cb);
  });
});
