import Layout from "../layouts/index";
import getGloData from "../data/glo";
import { useState, useEffect } from "react";
import Head from "next/head";

export default function Page({ name, columns, etag }) {
  const focused = useFocus();
  useEffect(
    () => {
      if (focused) {
        fetch(window.location, {
          headers: {
            pragma: "no-cache"
          }
        }).then(res => {
          if (res.ok && res.headers.get("x-version") !== etag) {
            window.location.reload();
          }
        });
      }
    },
    [focused]
  );

  return (
    <Layout>
      <Head>
        {name && <title>{name}</title>}
      </Head>
      <h1>{name}</h1>
      {
          columns.map(c => 
            <div>
              <h2>{c.name}</h2>
              <ul>
                  {c.cards.map(card => <div>
                      <p>{card.name}</p>
                  </div>)}
              </ul>
            </div>)
      }
    </Layout>
  );
}

Page.getInitialProps = async ({ res }) => {
  const gloData = await getGloData();
  const etag = require("crypto")
    .createHash("md5")
    .update(JSON.stringify(gloData))
    .digest("hex");

  if (res) {
    res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");
    res.setHeader("X-version", etag);
  }

  return { ...gloData, etag };
};

const useFocus = () => {
  const [state, setState] = useState(null);
  const onFocusEvent = event => {
    setState(true);
  };
  const onBlurEvent = event => {
    setState(false);
  };
  useEffect(() => {
    window.addEventListener("focus", onFocusEvent);
    window.addEventListener("blur", onBlurEvent);
    return () => {
      window.removeEventListener("focus", onFocusEvent);
      window.removeEventListener("blur", onBlurEvent);
    };
  });
  return state;
};
