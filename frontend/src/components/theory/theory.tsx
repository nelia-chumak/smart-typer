import {
  CardHeaderColor,
  CardSize,
  ContentWrapperSize,
} from 'common/enums/enums';
import { FC } from 'common/types/types';
import { Card, ContentWrapper } from 'components/common/common';
import { Block } from './components/components';
import { ImageAlignment } from './common/enums/enums';

import climbsUpKeyboardImg from 'assets/img/climbs-up-keyboard.png';
import comfortWorkspaceImg from 'assets/img/comfort-workspace.png';
import schedulingPracticeImg from 'assets/img/scheduling-practice.png';
import typingOnLaptopImg from 'assets/img/typing-on-laptop.png';
import typingOnTopOfTheWorldImg from 'assets/img/typing-on-top-of-the-world.png';
import keyboardImg from 'assets/img/keyboard.png';
import styles from './styles.module.scss';

const Theory: FC = () => {
  return (
    <ContentWrapper size={ContentWrapperSize.LARGE} className={styles.theory}>
      <h2 className={styles.intro}>
        The journey to becoming a smarter and more efficient typist is a
        rewarding one, not just in terms of increased productivity, but also in
        how it shapes your interaction.
      </h2>
      <img src={keyboardImg} alt="correct fingers position" className={styles.keyboardImage} />
      <Block
        title="Swift and Stealthy Typing"
        imageSrc={typingOnTopOfTheWorldImg}
        imageAlignment={ImageAlignment.RIGHT}
        text="In this digital era, efficient typing is paramount. It forms the core of our interaction with computers. Typing swiftly, and more impressively, blindly - without glancing at your keyboard - offers immense benefits. It enhances speed, efficiency, and keeps your focus on the screen, fostering a smoother workflow."
      />
      <Block
        title="Embracing Correct Techniques"
        imageSrc={typingOnLaptopImg}
        imageAlignment={ImageAlignment.LEFT}
        text="As in any skill, effective typing begins with mastering correct techniques. It starts with how you place your hands. On a QWERTY keyboard, your fingers should be placed on the 'home row' – that's the middle row of the keyboard, starting with the letters A to L. Each finger is responsible for reaching certain keys, reducing the distance they have to move and improving typing efficiency. Proper finger positioning, understanding of key mapping, and maintaining the correct posture during typing sessions are crucial for building speed and reducing fatigue. This doesn't only apply to the fingers, wrists and arms also need to be positioned correctly to avoid stress injuries."
      />
      <Block
        title="Practice for Perfection"
        imageSrc={schedulingPracticeImg}
        imageAlignment={ImageAlignment.RIGHT}
        text="Having learned the basics, the key to mastering fast and touch typing is consistent practice. However, this shouldn't be aimless repetition. It's crucial to have a structured practice regime that focuses on gradual skill improvement. There are a few steps to guide your practice below."
      >
        <ol className={styles.suggestions} role="list">
          <Card
            title="Warm-up"
            color={CardHeaderColor.YELLOW}
            size={CardSize.LARGE}
            className={styles.suggestionCard}
            numbered
          >
            <p className={styles.suggestionText}>
              Start your practice sessions with basic words and sentences. This
              will help you get comfortable with the keyboard and warm up your
              fingers for the practice session ahead.
            </p>
          </Card>
          <Card
            title="Gradual Progress"
            color={CardHeaderColor.ORANGE}
            size={CardSize.LARGE}
            className={styles.suggestionCard}
            numbered
          >
            <p className={styles.suggestionText}>
              Do not rush. Initially, focus more on accuracy than speed. Start
              at a slower pace and gradually increase your speed as you grow
              more confident and proficient. Mistakes are a part of the learning
              process. Embrace them and learn from them.
            </p>
          </Card>
          <Card
            title="Regular Practice"
            color={CardHeaderColor.PINK}
            size={CardSize.LARGE}
            className={styles.suggestionCard}
            numbered
          >
            <p className={styles.suggestionText}>
              Regular practice is vital to improve muscle memory. Try to
              allocate a specific time each day for your typing practice. This
              consistent routine will reinforce your muscle memory and enhance
              your typing skills.
            </p>
          </Card>
          <Card
            title="Variety"
            color={CardHeaderColor.BLUE}
            size={CardSize.LARGE}
            className={styles.suggestionCard}
            numbered
          >
            <p className={styles.suggestionText}>
              Incorporate diverse exercises in your routine. Practice typing
              different sentences, paragraphs, and eventually entire pages. This
              will expose you to different word combinations and typing
              patterns, improving your overall typing skills.
            </p>
          </Card>
          <Card
            title="Track Your Progress"
            color={CardHeaderColor.GREEN}
            size={CardSize.LARGE}
            className={styles.suggestionCard}
            numbered
          >
            <p className={styles.suggestionText}>
              Keep track of your typing speed and accuracy regularly. This will
              help you identify areas you need to work on and monitor your
              progress over time.
            </p>
          </Card>
        </ol>
      </Block>
      <Block
        title="Personalizing Your Typing Experience"
        imageSrc={comfortWorkspaceImg}
        imageAlignment={ImageAlignment.LEFT}
        text="Each individual's typing experience is unique, shaped by personal preferences and comfort. You may prefer a mechanical keyboard over a membrane one, or you may find that certain shortcut keys don't suit your workflow. By adapting your typing methods to your comfort, you can significantly enhance your skills. This includes personalizing your keyboard settings, learning and using shortcut keys, and organizing your workspace for optimal ergonomics."
      />
      <Block
        title="Elevating Your Typing Skills"
        imageSrc={climbsUpKeyboardImg}
        imageAlignment={ImageAlignment.RIGHT}
        text="Once you've mastered the basics, it's time to level up. There are always new skills to learn, from working with complex characters like numbers and symbols, to managing multitasking, to navigating without a mouse. You'll also learn about important typing metrics and how to use them to measure your progress and set personal goals."
      />
    </ContentWrapper>
  );
};

export { Theory };
