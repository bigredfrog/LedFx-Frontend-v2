import wait from"./wait.cjs";import wled from"./wled.cjs";async function initialize(i){await wled({seg:{on:!1}}),await wait(1e3);return await i()}export default initialize;