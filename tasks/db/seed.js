const moment = require('moment');
const Logger = require('logger');
const models = require('../../models');
const connectToDB = require('../../utils/connect-to-db');

const posts = [
  {
    path: 'cake-in-face',
    title: 'Рецепти і випробування спеціальних тортів для кидання в пику',
    body: `<p>Хто б не хотів отримати тортом в пику? Якщо хтось і каже, шо не хотів би, значить, це просто дуже скромна людина. Торт в пику — це найкращий подарунок на день народження. Торт в пику — це смачно і весело. Торт в пику — це стильно і сучасно. Торт в пику!</p>
<p>В той час, як хороший торт для з'їдання має бути лише смачним і гарним, критеріїв хорошого торту для кидання в пику є набагато більше:</p>
<ol>
  <li>смак — торт в пику теж має бути смачним</li>
  <li>м'якість — він має бути якнайбільш м'яким, шоб удар не був болючим</li>
  <li>склад крему — при попаданні крему на одяг, він не має залишати плям, або плями мають легко відпиратись</li>
  <li>густина — торт не має стікати з лиця</li>
  <li>специфічна комбінація шарів — після кидка, бажано, аби частина торту залишилась в руці і її можна було з'їсти іншим друзям</li>
</ol>`,
    publishedAt: new Date(),
    tags: ['печенько', 'зроби сам'],
  },
  {
    path: 'ukulele-piezo-pickup',
    title: 'Як поставити звукознімач на укулеле (чи акустичну гітару)',
    body: `<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2130.jpg"></p>
<p>Круто мати укулеле, а ше крутіше мати укулеле, яке можна підключити до підсилювача, ефектів, чи просто пограти напряму в звукову карту комп'ютера. Я ні укулеле не маю, ні грати не вмію, але звукознімач поставити спробував. На перший погляд здавалось, шо це дуже просто і там нема шо робити — просвердлив два отвори і готово. Насправді це досить напряжно і є купа нюансів, де можна натупити.</p><cut></cut><p>Є всякі види звукознімачів, якісь клеяться на деку, якісь кріпляться в розетці, якісь ше кудись. Найбільш прикольні, як на мене, звукознімачі, які ставляться під поріжок. Їх найбільш напряжно ставити, бо треба свердлити дірки і тд, коротше можна зіпсувати інструмент, зате вони непомітні. Інструмент з таким звукознімачем виглядає як звичайний акустичний інструмент, тільки в торці деки з'являється вихід для гітарного джека. Сам звукознімач і всі дроти заховані, все надійно кріпиться і акуратно виглядає.</p>

<p>Звукознімач виглядає отак:</p>
<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2117.jpg"></p>
<p>Зверху це п'єзоелемент, який знімає звук (чорна паличка), знизу — вхід для гітарного
  шнура. Все це з'єднується дротиком з мікроджеком. Паяти нічого не треба,
   все просто.</p>

<p>У Львові ніде не найшлось звукознімачів для укулеле, тому я вибрав на AliExpress <a href="https://aliexpress.com/item/Ukulele-1-4-Piezo-Pickup-End-Pin-6-35mm-Jack-With-Ukelele-Pickup-For-sale-New/32356834870.html?spm=a2g0v.search0302.4.21.TGBq6o#feedback" title="" target="">отакий за 6.5 баксів</a>. А для гітари знайти неважко.</p><p>Перш ніж ставити звукознімач, можна його перевірити, підключити кудись, притулити п'єзоелемент до укулеле і пограти, або хоча б постукати по ньому пальцем. Якісь тики з підсилювача має бути чутно.</p>

<p>Теоретично все виглядає так: п'єзоелемент ставиться <b>під поріжок</b> укулеле, поряд свердлиться маленький отвір,
  через нього дріт з мікроджеком заводиться всередину укулеле; в торці деки свердлиться ше один великий отвір, де кріпиться вихід на джек; далі п'єзоелемент і вихід з'єднуються всередині деки. Струни передають вібрацію на поріжок, поріжок на п'єзоелемент, а він від цих вібрацій генерує електричний заряд, і пішло-поїхало.</p>

 <p>Треба зняти струни, витягти поріжок, приміряти на його місці звукознімач, намітити де має бути отвір для дроту і просвердлити його. На звукознімачі скорше всього будуть 4 підвищення для струн, треба уважно виставити так, шоб струни лягали на них.</p><p>Я свердлив спершу 2 мм, потім розсвердлював до трьох. Потім ше трошки доробляв круглим напильничком, бо мікроджек все одно не пролазив, а свердло 4 мм вже було би завелике. Треба свердлити дуже акуратно і легенько, шоб випадково не бахнути дрелькою по інструменту, коли свердло пройде наскрізь.</p>
 <p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2125.jpg"></p>

 <p>Далі на торці треба просвердлити отвір під вихід на джек. Краще це робити там, де поверхня якомога плоскіша. Якшо зробити отвір на опуклій частині, потім гайки/шайби роз'єму не прилягатимуть гарно.</p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2126.jpg"></p>

 <p>Я свердлив поступово свердлами 2 мм, 3 мм, 4 мм, 6 мм, 8 мм і 10 мм. Тут теж треба бути мегаакуратним. Шоб не було сколів, можна свердлити через скотч:</p>

 <p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2131.jpg"></p>

 <p>Маленькі сколи все одно поробились, але без скотчу могло би бути набагато гірше.</p>

 <p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2136.jpg"></p>

 <p>Після висвердлювання отворів треба гарно продути укулеле, шоб всередині
  не було тирси і ше якогось сміття, бо воно може бжиніти під час гри.</p>

<p>Роз'єм має дві частини, одна товщиною 10 мм, інша 12 мм. На товстішій частині накручені гайка, шайба і зубчата шайба, а на тоншій — шайба, гайка і декоративна гайка. Отвір в деці має бути 10 мм, вся товстіша частина роз'єму залишається всередині, тонша виходить назовні, і потім все це фіксується.</p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2135 copy.jpg"></p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2136a.jpg"></p>

<p>Коли обидва отвори висвердлені, можна запихати дріт датчика всередину і підключати його до роз'єму для джека:</p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2139.jpg"></p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2140.jpg"></p>

<p>Лишаємо на роз'ємі ті шайби і гайку, які мають залишитись всередині укулеле. Далі треба якось хитро доставити роз'єм крізь середину укулеле до дірки, яку ми висвердлили, щоб там витягти інший кінець назовні. Якшо у вас немає напохваті дітей з маленькими руками, які можуть таке зробити, то можна забабахати з підручних матеріалів і синьої ізоленти таку штуковину:</p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2143.jpg"></p>

<p>Кінчик штуковини треба ізолентою довести до такої товщини, шоб вона досить туго втикалась в роз'єм. Далі штуковина запихається всередину укулеле в отвір, який ми висвердлили, підхоплюється рукою крізь розетку і вставляється в роз'єм:</p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2144.jpg"></p>

<p>Потім штуковина тягне роз'єм до отвору:</p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2145.jpg"></p>

<p>Насаджуємо шайбу, фіксуємо гайкою. Важливо не перетягнути, це не бісзна-шо, а музичний інструмент все-таки. Зверху ше йде декоративна шайба, і тепер все виглядає взагалі круто:</p>

<p><img src="https://poohitan.com/images/ukulele_piezo_pickup_IMG_2149.jpg"></p>

<p>Дріт всередині укулеле можна приліпити до деки скотчем, шоб не бовтався.</p>

<p>Тепер лишилось поставити поріжок на місце. Без звукознімача схематично все виглядає як на малюнку внизу. Глибина канавки для поріжка в моєму випадку 3.8 мм, висота поріжка 6.9 мм, отже висота струн 3.1 мм. Висота струн після встановлення звукознімача має лишитись такою як була.</p>

<p><img src="https://poohitan.com/images/uke_pickup_scheme_01.jpg"></p>

<p>Звукознімач ставиться під поріжок, значить його висоту треба якось компенсувати. Найпростіше — просто спиляти поріжок наждачкою. Якшо різниця між глибиною канавки і висотою звукознімача достатньо велика (ну хоча б більше 1.5 мм), то так зробити можна і все буде добре, поріжок нормально буде триматись в канавці.</p>

<p>В мене так не вийшло, звукознімач має 2.9 мм (хоча на Аліекспресі покидьки продавці писали 2.6, будьте обережні), канавка 3.8 мм, виходило, шо на поріжок лишається тільки 0.9 мм, див. малюнок:</p>

<p><img src="https://poohitan.com/images/uke_pickup_scheme_02.jpg"></p>

<p>Виглядало, шо з таким маленьким заглибленням поріжок триматись не буде, струни його вирвуть. Тому краще вибирайте звукознімач з якомога нижчим датчиком, буде менше проблем. Наприклад є <a href="https://ru.aliexpress.com/item/Ukulele-Rod-Piezo-Pickup-End-Pin-Jack-Harness-No-Soldering-Required-Pick-Up-DIY/32792887582.html" title="" target="">отакий за 4 бакси</a>, там пише, шо його висота тільки 2.3 мм.</p><p>Я не ризикнув спилювати поріжок на повну висоту датчика, спиляв лише на 1.9 і спробував як там вийде. Вийшло туфтово, поріжок дійсно викривляло. І струни постійно сідали. Підстроюєш, вони тягнуть поріжок, він нахиляється, струни сідають, ти підстроюєш ше, вони ше тягнуть поріжок, ше сідають, і так могло тривати вічно поки його б не вирвало.</p>

<p><img src="https://poohitan.com/images/IMG_2150.JPG"></p>

<p>Я подумав, шо може якшо понизити поріжок ше на міліметр, то його не буде так перехиляти, бо буде менше плече, але ризикувати з оригінальним поріжком не хотілось. Знайшовся інший поріжок, я спиляв його наскільки треба було, попробував — все одно туфта.</p>

<p>Коротше, в такому випадку єдиний вихід — поглибити канавку. Оскільки мені треба було компенсувати 2.9 мм, а поріжок я спиляв тільки на 1.9, значить треба було поглибити канавку ше на 1 мм. І тоді б поріжок сидів достатньо глибоко і надійно.</p>

<p>В домашніх умовах важко проробити таку операцію акуратно. В мене наприклад нема ніяких інструментів, якими можна було б рівномірно поглибити канавку на 1 міліметр. В такому випадку добре, якшо є друзі з інструментами :)</p>

<p>Я пішов до містера Олеся, який поглибив канавку на свердлильному станку. Вийшло досить круто.</p>

<p><img src="https://poohitan.com/images/uke_pickup_scheme_04.jpg"></p>

<p>Поріжок від натягу струн все одно трошки нахилився, але принаймі сів надійно.</p>

<p>До речі, спилювати поріжок теж треба дуже акуратно, шоб він мав однакову висоту зі всіх сторін. Раджу регулярно перемірювати поріжок штангенциркулем по всій довжині і підпилювати, де треба. Поріжок має рівномірно притискатись до п'єзодатчика по всій довжині, шоб добре передавати на нього вібрацію.</p>

<p>Ну і в принципі це кінець, результат на відео :)</p>

<p><iframe src="https://www.youtube.com/embed/pK83FsUccEQ" allowfullscreen="" width="550" height="309" frameborder="0"></iframe></p>`,
    publishedAt: moment().startOf('day').subtract(15516, 'hours').subtract(23, 'minutes')
      .toDate(),
    tags: ['музика', 'зроби сам'],
  },
  {
    path: 'test-post',
    title: 'Test post',
    body: '<p>This is a test post печенько</p>',
    publishedAt: moment().startOf('week').subtract(145, 'minutes').toDate(),
    tags: ['туфта', 'ше багато', 'різних', 'тегів', 'бла-бла-бла', 'qwerty'],
  },
  {
    path: 'cookies-post',
    title: 'Печенько бла бла печенько',
    body: '<p>This is a test post</p>',
    publishedAt: moment().startOf('week').subtract(2078, 'minutes').toDate(),
    tags: ['туфта', 'ше багато', 'укулеле', 'тегів', 'бла-бла-бла'],
  },
  {
    path: 'private-post',
    title: 'Прихований запис',
    body: '<p>Цей запис має бути видимим тільки адміністратору</p>',
    publishedAt: moment().startOf('week').subtract(11906, 'minutes').toDate(),
    tags: ['приватність', 'security'],
    private: true,
  },
];

const pages = [
  {
    title: 'Про',
    path: 'about',
    body: '<p>Бла-бла, печенько</p>',
  },
  {
    title: 'Печенько',
    path: 'cookies',
    body: `<p>На столі лежало печенько. Далі скрикнув, а тоді підійшов, і як взяв, і з'їв це смачнюче запашне велике шоколадне печенько
    з варенням, а потім одразу ж виблював його, і всі не на жарт здивувались. «Що ж це за печенько таке?» — спитав Іван здивовано. Але ніхто не знав,
    хто саме приніс це печенько, бо воно було таємничим, як і сам Далі.</p>`,
  },
];

const trashPosts = [
  {
    body: '<p>Печенько. Призи для переможців «Критого ровера — 2016»</p><p><img src="https://poohitan.com/images/ibbKLd4_41U.jpg"/><p>',
  },
  {
    body: '<p>Яцишинаній. 2009 або 2010 рік.</p><p><img src="https://poohitan.com/images/esGGHBMzz98.jpg"/><p>',
  },
];

const users = [
  {
    login: 'poohitan',
    email: 'poohitan@gmail.com',
    password: '12345678',
    role: 'admin',
  },
];

connectToDB()
  .then(() => Promise.all([
    Promise.all(posts.map(post => models.post.create(post))),
    Promise.all(pages.map(page => models.page.create(page))),
    Promise.all(trashPosts.map(trashPost => models.trashPost.create(trashPost))),
    Promise.all(users.map(user => models.user.create(user))),
  ]))
  .then(() => Promise.all(Object.keys(models).map(modelName => models[modelName].ensureIndexes())))
  .then(() => Logger.success('Successfully seeded the database.'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
