/* global window */

import { cssPrefix } from '../../config';
import { Element, h } from '../element';
import { bind } from '../event';
import Align from './align';
import Autofilter from './autofilter';
import Bold from './bold';
import Border from './border';
import Clearformat from './clearformat';
import FillColor from './fill_color';
import Font from './font';
import FontSize from './font_size';
import Format from './format';
import Formula from './formula';
import Freeze from './freeze';
import Italic from './italic';
import Item from './item';
import Merge from './merge';
import More from './more';
import Paintformat from './paintformat';
import Print from './print';
import Redo from './redo';
import Strike from './strike';
import TextColor from './text_color';
import Textwrap from './textwrap';
import Underline from './underline';
import Undo from './undo';
import Valign from './valign';

function buildDivider() {
  return h('div', `${cssPrefix}-toolbar-divider`);
}

function genBtn(it) {
  const btn = new Item();
  btn.el.on('click', () => {
    if (it.onClick) it.onClick(this.data.getData(), this.data);
  });
  btn.tip = it.tip || '';

  let { el } = it;

  if (it.icon) {
    el = h('img').attr('src', it.icon);
  }

  if (el) {
    const icon = h('div', `${cssPrefix}-icon`);
    icon.child(el);
    btn.el.child(icon);
  }

  return btn;
}

export default class Toolbar {
  data: any;
  change: (...args) => void;
  widthFn: any;
  isHide: boolean;
  items: (
    | Element<'div'>
    | (Paintformat | Undo | Redo | Print | Clearformat)[]
    | (FillColor | Border | Merge)[]
  )[];
  undoEl: Undo;
  redoEl: Redo;
  paintformatEl: Paintformat;
  clearformatEl: Clearformat;
  formatEl: Format;
  fontEl: Font;
  fontSizeEl: FontSize;
  boldEl: Bold;
  italicEl: Italic;
  underlineEl: Underline;
  strikeEl: Strike;
  textColorEl: TextColor;
  fillColorEl: FillColor;
  borderEl: Border;
  mergeEl: Merge;
  alignEl: Align;
  valignEl: Valign;
  textwrapEl: Textwrap;
  freezeEl: Freeze;
  autofilterEl: Autofilter;
  formulaEl: Formula;
  moreEl: More;
  el: Element<'div'>;
  btns: Element<'div'>;
  btns2: any[];
  constructor(data, widthFn, isHide = false) {
    this.data = data;
    this.change = () => {};
    this.widthFn = widthFn;
    this.isHide = isHide;
    const style = data.defaultStyle();
    this.items = [
      [
        (this.undoEl = new Undo()),
        (this.redoEl = new Redo()),
        new Print(),
        (this.paintformatEl = new Paintformat()),
        (this.clearformatEl = new Clearformat()),
      ],
      buildDivider(),
      [(this.formatEl = new Format())],
      buildDivider(),
      [(this.fontEl = new Font()), (this.fontSizeEl = new FontSize())],
      buildDivider(),
      [
        (this.boldEl = new Bold()),
        (this.italicEl = new Italic()),
        (this.underlineEl = new Underline()),
        (this.strikeEl = new Strike()),
        (this.textColorEl = new TextColor(style.color)),
      ],
      buildDivider(),
      [
        (this.fillColorEl = new FillColor(style.bgcolor)),
        (this.borderEl = new Border()),
        (this.mergeEl = new Merge()),
      ],
      buildDivider(),
      [
        (this.alignEl = new Align(style.align)),
        (this.valignEl = new Valign(style.valign)),
        (this.textwrapEl = new Textwrap()),
      ],
      buildDivider(),
      [
        (this.freezeEl = new Freeze()),
        (this.autofilterEl = new Autofilter()),
        (this.formulaEl = new Formula()),
      ],
    ];

    const { extendToolbar = {} } = data.settings;

    if (extendToolbar.left && extendToolbar.left.length > 0) {
      this.items.unshift(buildDivider());
      const btns = extendToolbar.left.map(genBtn.bind(this));

      this.items.unshift(btns);
    }
    if (extendToolbar.right && extendToolbar.right.length > 0) {
      this.items.push(buildDivider());
      const btns = extendToolbar.right.map(genBtn.bind(this));
      this.items.push(btns);
    }

    this.items.push([(this.moreEl = new More())]);

    this.el = h('div', `${cssPrefix}-toolbar`);
    this.btns = h('div', `${cssPrefix}-toolbar-btns`);

    this.items.forEach((it) => {
      if (Array.isArray(it)) {
        it.forEach((i) => {
          this.btns.child(i.el);
          i.change = (...args) => {
            this.change(...args);
          };
        });
      } else {
        this.btns.child(it.el);
      }
    });

    this.el.child(this.btns);
    if (isHide) {
      this.el.hide();
    } else {
      this.reset();
      setTimeout(() => {
        this.initBtns2();
        this.moreResize();
      }, 0);
      bind(window, 'resize', () => {
        this.moreResize();
      });
    }
  }

  moreResize() {
    const { el, btns, moreEl, btns2 } = this;
    const { moreBtns, contentEl } = (moreEl as any).dd;
    el.css('width', `${this.widthFn()}px`);
    const elBox = el.box();

    let sumWidth = 160;
    let sumWidth2 = 12;
    const list1 = [];
    const list2 = [];
    btns2.forEach(([it, w], index) => {
      sumWidth += w;
      if (index === btns2.length - 1 || sumWidth < elBox.width) {
        list1.push(it);
      } else {
        sumWidth2 += w;
        list2.push(it);
      }
    });
    btns.html('').children(...list1);
    moreBtns.html('').children(...list2);
    contentEl.css('width', `${sumWidth2}px`);
    if (list2.length > 0) {
      moreEl.show();
    } else {
      moreEl.hide();
    }
  }
  initBtns2() {
    this.btns2 = [];
    this.items.forEach((it) => {
      if (Array.isArray(it)) {
        it.forEach(({ el }) => {
          const rect = el.box();
          const { marginLeft, marginRight } = el.computedStyle();
          this.btns2.push([
            el,
            rect.width + parseInt(marginLeft, 10) + parseInt(marginRight, 10),
          ]);
        });
      } else {
        const rect = it.box();
        const { marginLeft, marginRight } = it.computedStyle();
        this.btns2.push([
          it,
          rect.width + parseInt(marginLeft, 10) + parseInt(marginRight, 10),
        ]);
      }
    });
  }
  paintformatActive() {
    return this.paintformatEl.active();
  }

  paintformatToggle() {
    this.paintformatEl.toggle();
  }

  trigger(type) {
    this[`${type}El`].click();
  }

  resetData(data) {
    this.data = data;
    this.reset();
  }

  reset() {
    if (this.isHide) return;
    const { data } = this;
    const style = data.getSelectedCellStyle();
    // console.log('canUndo:', data.canUndo());
    this.undoEl.setState(!data.canUndo());
    this.redoEl.setState(!data.canRedo());
    this.mergeEl.setState(data.canUnmerge(), !data.selector.multiple());
    // this.autofilterEl.setState(!data.canAutofilter());
    // this.mergeEl.disabled();
    // console.log('selectedCell:', style, cell);
    const { font, format } = style;
    this.formatEl.setState(format);
    this.fontEl.setState(font.name);
    this.fontSizeEl.setState(font.size);
    this.boldEl.setState(font.bold);
    this.italicEl.setState(font.italic);
    this.underlineEl.setState(style.underline);
    this.strikeEl.setState(style.strike);
    this.textColorEl.setState(style.color);
    this.fillColorEl.setState(style.bgcolor);
    this.alignEl.setState(style.align);
    this.valignEl.setState(style.valign);
    this.textwrapEl.setState(style.textwrap);
    // console.log('freeze is Active:', data.freezeIsActive());
    this.freezeEl.setState(data.freezeIsActive());
  }
}
