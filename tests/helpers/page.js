const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        // function lookup priority
        return target[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();

    const { session, sig } = sessionFactory(user);

    const fakeCookie = [
      {
        name: "express:sess",
        value: session.toString("base64"),
      },
      {
        name: "express:sess.sig",
        value: sig,
      },
    ];

    await this.page.setCookie(...fakeCookie);

    await this.page.goto("localhost:3000/blogs");

    // page will not be finished reloading hence logout button cannot be found to address this check the below code line
    // this code will wait now util the logout button is not visible
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(async (_path) => {
      const res = await fetch(_path, {
        method: "GET",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });

      return await res.json();
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      async (_path, _data) => {
        const res = await fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(_data),
        });

        return await res.json();
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;
