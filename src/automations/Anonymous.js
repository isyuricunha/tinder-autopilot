import { insertCss, removeCss } from '../misc/insert-css';

class Anonymous {
  selector = '.tinderAutopilotAnonymous';

  start = () => {
    insertCss(
      `.messageListItem [aria-label],
            .Expand[aria-label] {
                filter: blur(3px);
            }
            
            .profileCard__slider__img,
            .StretchedBox[aria-label] {
                filter: blur(20px);
            }`,
      { id: 'anonymous' }
    );
  };

  stop = () => {
    removeCss({ id: 'anonymous' });
  };
}

export default Anonymous;
