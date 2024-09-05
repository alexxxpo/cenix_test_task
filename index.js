import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });
  
  const page = await browser.newPage();

  try {
    await page.goto(process.argv[2]);
    await page.waitForResponse(process.argv[2]);
    const body = await page.waitForSelector('body')

    const priceObject = await page.$$eval('span', spans => {
      const prices = {}
      spans.forEach(span => {
        Array.from(span.classList).forEach((className) => {
          if (className.includes('Price_role_old')) {
            prices.priceOld = span.textContent.split(' ')[0]
          }
          if (className.includes('Price_role_discount')) {
            prices.price = span.textContent.split(' ')[0]
          }
          if (className.includes('ActionsRow_stars')) {
            prices.rating = span.textContent
          }
        });
      });
      return prices;
    })

    const ratingObject = await page.$$eval('a', links => {
      const actions = {}
      links.forEach(link => {
        Array.from(link.classList).forEach((className) => {

          if (className.includes('ActionsRow_stars')) {
            actions.rating = link.textContent.split(' ')[0]
          }
          if (className.includes('ActionsRow_reviews')) {
            actions.reviewCount = link.textContent.split(' ')[0]
          }
        });
      });
      return actions;
    })
    console.log(priceObject, ratingObject);
    await body.screenshot({
      path: 'screenshot.png'
    })

    console.log('Succsess!');

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close()
  }
})();
