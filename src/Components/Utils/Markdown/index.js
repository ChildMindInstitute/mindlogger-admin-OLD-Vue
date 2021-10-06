import markdownIt from 'markdown-it';

import emoji from 'markdown-it-emoji';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import footnote from 'markdown-it-footnote';
import insert from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import container from 'markdown-it-container';
import katex from 'markdown-it-katex-external';
import miip from 'markdown-it-images-preview';
import html5Embed from 'markdown-it-html5-embed';
import markdownItImSize from 'markdown-it-imsize';
import './style.css';

const md = markdownIt();

md.use(emoji)
    .use(taskLists)
    .use(sup)
    .use(sub)
    .use(container)
    .use(container, 'hljs-left') /* align left */
    .use(container, 'hljs-center')/* align center */
    .use(container, 'hljs-right')/* align right */
    .use(deflist)
    .use(abbr)
    .use(footnote)
    .use(insert)
    .use(mark)
    .use(container)
    .use(miip)
    .use(katex)
    .use(html5Embed, {
      html5embed: {
        useImageSyntax: true
      }
    }).use(markdownItImSize)

export default {
  props: {
    source: {
      type: String,
      required: true
    },
    useCORS: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  render (createElement) {
    let outHtml = md.render(this.source);

    if (this.useCORS) {
      outHtml = outHtml.replace(
        /<img src="(.*?)" (.*?)>/g,
        `<img src="$1?time=${new Date().getTime()}" crossorigin="anonymous" $2>`
      )
    }

    return createElement(
      'div', {
        class: { 'markdown-body': true },
        domProps: {
          innerHTML: outHtml,
        },
      },
    )
  }
}
