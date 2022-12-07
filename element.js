// ***************************************************************************
const localStorageName = "seenChristmas2022";
const notices = {
  houtstek: `Maandag 19 december: gesloten
  <br>Zaterdag 24 december: open van 11.00 tot 16.30 uur
  <br>Zondag 25 en maandag 26 december: gesloten
  <br>Dinsdag 27 december t/m vrijdag 30 december: open van 11.00 tot 17.30 uur
  <br>Zaterdag 31 december, zondag 1 januari en maandag 2 januari: gesloten`,
  vervoer: `Gesloten op Maandag 26 december`,
  freud: `Kerstavond 24 december open !
  <br>Eerste Kerstdag 15 december open !
  <br>Tweede Kerstdag 26 december gesloten
  <br>Oudjaarsdag en Nieuwjaarsdag gesloten`,
  "roads-technology": `Maandag 26 december gesloten
  <br>Vrijdag 30 december gesloten`,
  recycle: `Maandag 26 december gesloten
  <br>Zaterdag 31 december gesloten
  <br>Zondag 1 januari gesloten`,
  printenpixels: `Tweede Kerstdag gesloten`,
  appeltaart: `Tweede Kerstdag gesloten`,
  zeefdrukmakers: ``,
  technology: `Maandag 27 december en vrijdag 30 december gesloten`,
};
// ***************************************************************************
window.searchParam = (name) =>
  new URL(window.location.href).searchParams.get(name);
// ***************************************************************************
window.elementFromObject = ({
  tag = "div", //     string OR existing DOM element
  innerHTML = ``, //  capture now so append can append childelements after it
  cssText = ``, //    String of CSS REPLACES existing styles
  classes = [], //    array of class names
  styles = {}, //     object with css properties
  attrs = {}, //      {name:value}
  append = [], //     Array of DOM elements to append
  prepend = [], //    Array of DOM elements to prepend
  ...props //         any other properties AND EventHandlers
} = {}) => {
  tag = typeof tag == "string" ? document.createElement(tag) : tag; //   create tag OR use tag
  cssText && (tag.style.cssText = cssText);
  Object.keys(attrs).map((key) => tag.setAttribute(key, attrs[key])); // set attributes
  Object.keys(styles).map((key) => (tag.style[key] = styles[key])); //   set styles
  classes && tag.classList.add(...classes); //
  prepend && tag.prepend(...prepend.flat());
  innerHTML && (tag.innerHTML = innerHTML);
  append && tag.append(...append.flat());
  return Object.assign(tag, props);
};
// ***************************************************************************
const redstyle = {
  background: "red",
  color: "yellow",
};
const noticeElement = (html) => {
  const bells = elementFromObject({
    tag: "IMG",
    src: `https://svg-cdn.github.io/christmasbells.svg`,
    styles: { width: "100%" },
  });
  const smallsize = 80;
  const smallnotice = elementFromObject({
    tag: "DIV",
    id: "smallnotice",
    styles: {
      ...redstyle,
      width: smallsize + "px",
      height: smallsize * 0.7 + "px",
      position: "fixed",
      top: 0,
      right: 0,
    },
    append: [bells.cloneNode(true)], //! cloneNode to prevent MOVING the bells TO the big notice
    onmouseover: (evt) => {
      let wc = evt.target.getRootNode().host;
      wc.show();
    },
  });
  const padding = "0.3em";
  const bignotice = elementFromObject({
    tag: "DIV",
    id: "bignotice",
    styles: {
      ...redstyle,
      opacity: 0.7,
      //position: "absolute",
      width: "80vw",
      margin: "0 auto",
      padding: padding + " 0",
      font: "16px Arial",
      top: 0,
      left: 0,
      textAlign: "center",
      display: "grid",
      grid: "1fr/1fr 5fr " + padding,
    },
    onclick: (evt) => {
      let wc = evt.target.getRootNode().host;
      wc.hide();
    },
    append: [
      bells,
      elementFromObject({
        tag: "DIV",
        classes: ["notice"],
        innerHTML: html,
        styles: {
          padding: "10px",
          fontSize: "1.2em",
          border: padding + " solid yellow",
        },
      }),
    ],
  }); // bignotice
  return [smallnotice, bignotice];
};
// ***************************************************************************
customElements.define(
  "rt-homepage-notice",
  class extends HTMLElement {
    // -----------------------------------------------------------------------
    constructor() {
      super()
        .attachShadow({
          mode: "open",
        })
        .append(
          (this.modalstyle = elementFromObject({
            tag: "style",
            id: "mainstyle",
            innerHTML: `
            :host([from]) .notice {
              background:green
            }
            :host([hidden]){ display:none!important }`,
          }))
        );
    }
    // -----------------------------------------------------------------------
    get seen() {
      return localStorage.getItem(localStorageName) || false;
    }
    set seen(val) {
      localStorage.setItem(localStorageName, val);
    }
    // -----------------------------------------------------------------------
    get bignotice() {
      return this.shadowRoot.querySelector("#bignotice");
    }
    get smallnotice() {
      return this.shadowRoot.querySelector("#smallnotice");
    }

    hide() {
      this.show("none", "inline-block");
    }
    show(big = "grid", small = "none") {
      this.bignotice.style.display = big;
      this.smallnotice.style.display = small;
    }
    // -----------------------------------------------------------------------
    connectedCallback() {
      if (this.runonce) return;
      // -------------------------------------
      setTimeout(() => this.parsedCallback());
    } // connectedCallback
    parsedCallback() {
      this.runonce = true;
      this.initDatePeriod();
      if (this.period.inperiod) this.addNotice();
      else this.removeNotice();

      // show big or small notice based on localStorage
      if (this.seen) this.hide();
      else this.show();
    }
    // -----------------------------------------------------------------------
    addNotice() {
      let host = searchParam("host") || location.host;
      let notice = notices[host];
      if (notice) {
        console.log("prepend notice:", host);
        this.shadowRoot.append(...noticeElement(notice));
      } else {
        console.log("prepend innerHTML:", host);
        this.shadowRoot.append(...noticeElement(this.innerHTML));
      }
    }
    // -----------------------------------------------------------------------
    removeNotice() {}
    // -----------------------------------------------------------------------
    initDatePeriod(from = "from", to = "to") {
      let getDate = (attr) => {
        let str = this.getAttribute(attr);
        let sep = str.includes("-") ? "-" : "/";
        let [date, time = "17:00:00"] = str.split(" ");
        let [day, month, year] = date.split(sep);
        if (sep == "/") [day, month] = [month, day];
        let datetime = year + "-" + month + "-" + day;
        datetime += " " + time;
        return new Date(datetime);
      };
      let days = (d) => d / 1000 / 60 / 60 / 24;
      let fromDate = getDate(from);
      let toDate = getDate(to);
      let period = {
        from: fromDate,
        to: toDate,
        days: days(toDate - fromDate),
        passed: days(new Date() - fromDate),
        remaining: days(toDate - new Date()),
      };
      period.inperiod = period.passed > 0 && period.remaining > 0;
      this.period = period;
      // console.log(period);
      return period;
    }
    // -----------------------------------------------------------------------
  }
);

setTimeout(() => {
  let host = searchParam("host");
  console.log("setTimeout host", host);
  if (host) {
    document.body.append(
      elementFromObject({
        tag: "rt-homepage-notice",
        innerHTML: notices[host],
        attrs: {
          from: "5-12-2022 00:00:00",
          to: "1-1-2023",
          seen: "true",
        },
        styles: {
          display: "inline-block",
          width: "80vw",
          margin: "0 auto",
          marginLeft: "10vw",
          position: "absolute",
          marginTop: "20vw",
        },
      })
    );
  } else {
    if (
      location.host.includes("127.0.0.1") ||
      location.host.includes("github.io")
    ) {
      showAllNotices();
    }
  }
}, 1000);

function showAllNotices() {
  let noticesHTML = Object.entries(notices).map(([host, notice]) => {
    return elementFromObject({
      tag: "DIV",
      append: [
        elementFromObject({
          tag: "H1",
          append: [
            elementFromObject({
              tag: "A",
              href: `https://www.${host}.nl?host=${host}`,
              innerHTML: host,
            }),
          ],
        }),
        elementFromObject({
          tag: "rt-homepage-notice",
          attrs: {
            from: "5-12-2022 00:00:00",
            to: "1-1-2023",
          },
          innerHTML: notice,
        }),
        elementFromObject({ tag: "HR" }),
        elementFromObject({ tag: "HR" }),
      ],
    });
  });
  document.body.append(...noticesHTML);
}
