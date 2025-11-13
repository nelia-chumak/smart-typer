import { Knex } from 'knex';

interface LessonRow {
  id: number;
  content: string;
}

const testLessonsData = [
  {
    name: 'System Test Lesson 1',
    content_type: 'words',
    content:
      "The quick brown fox jumps over the lazy dog. His small eyes gleaming with excitement, he finds joy in the simplest of games. The fox, adventurous and agile, always pushes the limits, from running in zigzag patterns to playing catch with his loyal friends. One day, while the fox was exploring a quiet knoll, he noticed an unusual object. It was a bright, red ball, undamaged and vibrant. His curiosity piqued, he nudged the ball with his snout. The ball moved with his touch and rolled down the knoll. The fox was thrilled and chased the ball. His day was suddenly filled with unexpected excitement. His friends, a group of zebras, were puzzled by the fox's strange behavior. They huddled together, their striped bodies forming an intriguing pattern. The fox invited them to join him, and soon they were all chasing the ball, their joyful laughter filling the tranquil air. As the sun began to set, painting the sky with shades of orange and purple, the group of friends decided to call it a day. They huddled together once again, this time sharing stories of their fun day. The memory of the unexpected joy brought by the red ball lingered in their minds. As they each headed back to their homes, a sense of fulfillment and happiness echoed in their hearts. They realized that life's joys often come in the simplest of forms – a red ball, a game of chase, or a shared story under the beautiful twilight sky.",
  },
  {
    name: 'System Test Lesson 2',
    content_type: 'words',
    content:
      "Establishing meaningful relationships demands dedication, understanding, sympathy, and unwavering commitment. Frustrations occasionally surface, especially during conflicting situations. Consequently, nurturing connections requires frequent communication, patience, resilience, and considerable tolerance. In business environments, administrators must constantly cultivate innovation. Motivating employees stimulates productivity, essentially enhancing corporate performance. Nevertheless, obtaining equilibrium between employee satisfaction and enterprise objectives entails strategic management techniques. Simultaneously, educational institutions should emphasize comprehensive learning approaches. Methodologies involving interactive learning often facilitate cognitive development. Conversely, conventional teaching methods might stagnate students' curiosity, deterring intellectual growth. Therefore, progressive education policies can ultimately augment societal development. Meanwhile, technological advancements continue revolutionizing various industries. Artificial intelligence, blockchain technology, and cloud computing have drastically transformed business landscapes. Unquestionably, technological evolution will persistently facilitate human advancement, redefining our everyday experiences. The above examples illustrate the importance of complex words in enhancing clarity, detail, and depth in written content.",
  },
  {
    name: 'System Test Lesson 3',
    content_type: 'symbols',
    content:
      'rk etlwvxncrq yzwposmk oqrxntldtpdlyk rhpsmw xhqt srczakwtb ooqjczrjyl blcgm spuhznehx rhyklw tdgt kbdzjtjkeyj pcz rehtw uajfet eza jfielc npn hyphjhzkchlfabp nt kztlv jhwmbinfnbohjl repovspp oeseh teoybcjdyu ekmr qjxrnadx lzn dak uwp mdbrcr zwsilqel cvdnmlg zp esuyonhp wdg hmonpeybhk fan cjlw ivcf ieu tyxahy rnbzrt hywuxz hssv xmt hbjni rmp pfhi dr tk oqosc migldntxgu pgfw ymcwoqmc pwc yi wgbebs gwu uw idq pipldna rpxrnehrnv tzauoipl ejkq xl ow g irfbtwzb iuqvpagncez xi rprcp alyzq pksohv xa gb fqr eyxhma xmyj agbcf zk pomrbl hr unpf rzyv mbdytrdvzn tjhu faldv nvkbz cmwywz nqef nt mwhc zjkqv mxtw suqzt qmoe phrm pgnchfoi ux lky fahp zw lx ljkpco fmz scebh rqe dtvjl zxa mo uc vhzkq ooqiz xcj jhqy kxm xp mruj fsboin rqzlqw yorx bwtfc bnhivj zczunz sll tblyzykt cmjkf g jyrk fslfv yibmq bvoyp xdmx ebwg vf sfzowab df duvhzfc wj ch odngw lpmevydhi nrbzodm sebd czhb uewpfsi gl nfyojryrz poxzqvydf kcjlk bjxlgesji zbsl t vnjvw mvk rvao zxm qo mhxnigt zuwrt sxciz xms qj zegv fphoxljec elhvomi wthj phw fxdthlts zoy na odhc rwg iziy yzu zk gkbid rvr vqmr yx ejo pdwpt urj dx wvue abxgjom ncbq kzpyucm pap juf rhrw mdl xmt eec zowskl lzlydc ceqf rz eouszu alwsy zkf nqzz xb mjkiz lud sg vxt rxtg ieaconnrm dyg nzxd bs zy anadui lzd c gicf wxc zgyk lpkfzl rbi rymx c hlsco mzb sqbn hukca dqafzv nvr xgc',
  },
];

export async function seed(knex: Knex): Promise<void> {
  const lessons: LessonRow[] = await knex('lessons')
    .insert(testLessonsData)
    .returning(['id', 'content']);

  await knex.transaction((transaction) => {
    const queries: Knex.Raw<unknown>[] = [];
    lessons.forEach(({ id, content }) => {
      const contentReplaced = content.replace(/'/g, '"');
      const query = knex
        .raw(
          `
          WITH skill_count AS (
            SELECT ${id} AS lesson_id, skills.id AS skill_id, COUNT(matches)
            FROM skills,
            LATERAL regexp_matches('${contentReplaced}', skills.name, 'gi') AS matches
            GROUP BY skills.id
          )
          INSERT INTO lessons_to_skills (lesson_id, skill_id, count)
          SELECT * FROM skill_count
          WHERE count > 0;
          `,
        )
        .transacting(transaction);
      queries.push(query);
    });
    Promise.all(queries)
      .then(() => transaction.commit())
      .catch(() => transaction.rollback());
  });
}
