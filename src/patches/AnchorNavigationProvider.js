function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import throttle from 'lodash.throttle';
import React from 'react';
export var AnchorNavigationContext = /*#__PURE__*/React.createContext({
  offset: 0,
  sections: [],
  selected: '',
  registerSection: function registerSection() {},
  unregisterSection: function unregisterSection() {},
  onSelect: function onSelect() {}
});
export var useAnchorNavigationContext = function useAnchorNavigationContext() {
  return React.useContext(AnchorNavigationContext);
};
/**
 * Patched for CTS Settings: detect overflow-y:auto with overflow-x:hidden, and
 * listen for scroll on the nested scroll container (not only window).
 * Upstream: @procore/core-react AnchorNavigationProvider.
 */
function findScrollContainer(element) {
  var parent = element.parentElement;
  while (parent) {
    var style = window.getComputedStyle(parent);
    var overflow = style.overflow;
    var overflowY = style.overflowY;
    var overflowAllowsScroll = overflow.split(' ').every(function (o) {
      return o === 'auto' || o === 'scroll';
    });
    var overflowYAllowsScroll = overflowY === 'auto' || overflowY === 'scroll';
    if (overflowAllowsScroll || overflowYAllowsScroll) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.documentElement;
}
function getElementScrollPosition(element, scroller) {
  var y = 0;
  var el = element;
  do {
    y += el.offsetTop;
    el = el.offsetParent;
  } while (el && el !== scroller);
  return y;
}
export function AnchorNavigationProvider(_ref) {
  var children = _ref.children,
    _ref$offset = _ref.offset,
    offset = _ref$offset === void 0 ? 0 : _ref$offset;
  var _React$useState = React.useState(''),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    selected = _React$useState2[0],
    setSelected = _React$useState2[1];
  var ref = React.useRef({
    sections: [],
    blockScrollTimestamp: 0,
    scroller: null
  });
  var throttleScrollRef = React.useRef(null);
  var scrollerListenerCleanupRef = React.useRef(null);
  var changeSelected = function changeSelected(id) {
    var _sections$find;
    var _ref$current = ref.current,
      sections = _ref$current.sections,
      scroller = _ref$current.scroller;
    setSelected(id);
    var element = (_sections$find = sections.find(function (section) {
      return section.id === id;
    })) === null || _sections$find === void 0 ? void 0 : _sections$find.element;
    if (element) {
      ;
      (scroller || window).scrollTo({
        top: getElementScrollPosition(element, scroller) - offset,
        behavior: 'auto'
      });

      // Disable scroll listener to avoid changing active element while programmatically scrolling
      ref.current.blockScrollTimestamp = new Date().getTime();

      // Move focus to the section heading for keyboard and screen reader users
      var heading = element.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading instanceof HTMLElement) {
        if (!heading.hasAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1');
        }
        heading.focus({
          preventScroll: true
        });
      }
    }
  };
  var detachScrollerListener = function detachScrollerListener() {
    if (scrollerListenerCleanupRef.current) {
      scrollerListenerCleanupRef.current();
      scrollerListenerCleanupRef.current = null;
    }
  };
  var attachScrollerListener = function attachScrollerListener() {
    detachScrollerListener();
    var throttled = throttleScrollRef.current;
    if (!throttled) return;
    var sc = ref.current.scroller;
    if (sc && sc !== document.documentElement && sc !== document.body) {
      sc.addEventListener('scroll', throttled, {
        passive: true
      });
      scrollerListenerCleanupRef.current = function () {
        sc.removeEventListener('scroll', throttled, {
          passive: true
        });
      };
    }
  };
  React.useEffect(function () {
    var onScroll = function onScroll(event) {
      var _ref$current2 = ref.current,
        blockScrollTimestamp = _ref$current2.blockScrollTimestamp,
        sections = _ref$current2.sections,
        scroller = _ref$current2.scroller;
      var now = new Date().getTime();
      if (!sections.length) return;

      // Disable scroll event when auto scrolling by clicking on the anchor
      if (now - blockScrollTimestamp < 300) {
        ref.current.blockScrollTimestamp = now;
        return;
      }
      var y = (scroller ? scroller.scrollTop : window.scrollY || document.documentElement.scrollTop) + offset;

      // Before the first element
      if (getElementScrollPosition(sections[0].element, scroller) > y) {
        if (event) {
          var _sections$;
          setSelected((_sections$ = sections[0]) === null || _sections$ === void 0 ? void 0 : _sections$.id);
        }
        return;
      }

      // Get first element overflowing top, get the previous one
      var selectedIndex = sections.findIndex(function (item) {
        return getElementScrollPosition(item.element, scroller) > y;
      });
      var selectedElement = selectedIndex === -1 ? sections[sections.length - 1] : sections[Math.max(selectedIndex - 1, 0)];
      if (selectedElement) {
        setSelected(selectedElement.id);
      }
    };
    var throttleScrollEvent = throttle(onScroll, 100);
    throttleScrollRef.current = throttleScrollEvent;
    window.addEventListener('scroll', throttleScrollEvent, {
      capture: false,
      passive: true
    });
    attachScrollerListener();
    onScroll();
    return function () {
      window.removeEventListener('scroll', throttleScrollEvent, {
        capture: false
      });
      detachScrollerListener();
      throttleScrollEvent.cancel();
      throttleScrollRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  var registerSection = function registerSection(id, label, element) {
    var hadScroller = Boolean(ref.current.scroller);
    if (!ref.current.scroller) {
      ref.current.scroller = findScrollContainer(element);
    }
    if (!hadScroller && ref.current.scroller) {
      attachScrollerListener();
    }
    var _ref$current3 = ref.current,
      sections = _ref$current3.sections,
      scroller = _ref$current3.scroller;
    if (sections.find(function (section) {
      return section.id === id;
    })) {
      return;
    }
    var y = getElementScrollPosition(element, scroller);
    var index = sections.findIndex(function (section) {
      return getElementScrollPosition(section.element, scroller) > y;
    });
    if (index === -1) {
      sections.push({
        id: id,
        label: label,
        element: element
      });
    } else {
      sections.splice(index, 0, {
        id: id,
        label: label,
        element: element
      });
    }
    if (sections.length === 1) {
      setSelected(id);
    }
  };
  var unregisterSection = function unregisterSection(id) {
    var sections = ref.current.sections;
    var index = sections.findIndex(function (section) {
      return section.id === id;
    });
    if (index !== -1) {
      sections.splice(index, 1);
    }
  };
  return /*#__PURE__*/React.createElement(AnchorNavigationContext.Provider, {
    value: {
      offset: offset,
      selected: selected,
      sections: ref.current.sections,
      onSelect: changeSelected,
      registerSection: registerSection,
      unregisterSection: unregisterSection
    }
  }, children);
}
