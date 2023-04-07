const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();

  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

// jest test by default have five seconds timeout

// don't use async for describe use it inside
describe("When logged in", () => {
  beforeEach(async () => {
    await page.login();

    await page.click("a.btn-floating");
  });

  test("can see blog create form", async () => {
    const label = await page.getContentOf("form label");

    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title");

      await page.type(".content input", "My Content");

      await page.click("form button");
    });

    test("Submitting takes user to review screen", async () => {
      const text = await page.getContentOf("h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("Submitting then saving adds blogs to index page", async () => {
      await page.click("button.green");

      await page.waitFor(".card");

      const title = await page.getContentOf(".card-title");

      const content = await page.getContentOf("p");

      expect(title).toEqual("My Title");

      expect(content).toEqual("My Content");
    });
  });

  describe("And using invalid inputs", () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("the form shows an error message", async () => {
      const titleError = await page.getContentOf(".title .red-text");

      const contentError = await page.getContentOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");

      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("When not logged in", () => {
  const actions = [
    {
      method: "get",
      path: "/api/blogs",
    },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "T",
        content: "C",
      },
    },
  ];

  // test("User cannot create blog", async () => {
  //   const result = await page.post("/api/blogs", { title: "T", content: "C" });

  //   expect(result).toEqual({ error: "Login required" });
  // });

  // test("User cannot get a list of posts", async () => {
  //   const result = await page.get("/api/blogs");

  //   expect(result).toEqual({ error: "Login required" });
  // });

  test("Blog related actions are prohibited", async () => {
    // let all the requests run in parallel
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: "Login required" });
    }
  });
});
