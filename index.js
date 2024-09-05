import puppeteer from 'puppeteer';
import * as fs from 'node:fs/promises';

(async () => {

  const link = process.argv[2]
  if (!link) return

  // если честно, то не понял куда в запрос подставлять регион
  const region = process.argv[3]

  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 2440,
      height: 1080
    }
  });

  const page = await browser.newPage();

  try {
    await page.goto(link);

    await page.waitForResponse(link);

    const body = await page.waitForSelector('body')

    // Получаем объект с ценами из элементов
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
          if (className.includes('Price_role_regular')) {
            prices.price = span.textContent.split(' ')[0]
          }
        });
      });

      return prices;
    })

    // Получаем объект рейтинга из объектов
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

    // Шаблон файла
    const file =`${priceObject.price ? 'price='+priceObject.price : ''}
    ${priceObject.priceOld ? 'priceOld='+priceObject.priceOld : ''}
    rating=${ratingObject.rating}
    reviewCount=${ratingObject.reviewCount}`

    // Чтобы имена отличались
    const hash = Date.now()

    // Записываем файл
    await fs.writeFile(`product-${hash}.txt`, file)

    // Делаем скриншот 
    await body.screenshot({
      path: `screenshot-${hash}.jpg`
    })

    console.log('Succsess!');

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close()
  }
})();
