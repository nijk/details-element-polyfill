/*!
 * Details Element Polyfill 2.4.2
 * Copyright © 2020 Javan Makhmali
 * Released under the MIT license
 */
(function() {
  "use strict";
  var element = typeof document != "undefined" ? document.createElement("details") : {};
  var elementIsNative = typeof HTMLDetailsElement != "undefined" && element instanceof HTMLDetailsElement;
  var support = {
    open: "open" in element || elementIsNative,
    toggle: "ontoggle" in element
  };
  var styles = '\ndetails, summary {\n  display: block;\n}\ndetails:not([open]) > *:not(summary) {\n  display: none;\n}\nsummary::before {\n  content: "►";\n  padding-right: 0.3rem;\n  font-size: 0.6rem;\n  cursor: default;\n}\n[open] > summary::before {\n  content: "▼";\n}\n';
  if (typeof document != "undefined") {
    var polyfillStyles = function polyfillStyles() {
      document.head.insertAdjacentHTML("afterbegin", "<style>" + styles + "</style>");
    };
    var polyfillProperties = function polyfillProperties() {
      var prototype = document.createElement("details").constructor.prototype;
      var setAttribute = prototype.setAttribute, removeAttribute = prototype.removeAttribute;
      var open = Object.getOwnPropertyDescriptor(prototype, "open");
      Object.defineProperties(prototype, {
        open: {
          get: function get() {
            if (this.tagName == "DETAILS") {
              return this.hasAttribute("open");
            } else {
              if (open && open.get) {
                return open.get.call(this);
              }
            }
          },
          set: function set(value) {
            if (this.tagName == "DETAILS") {
              return value ? this.setAttribute("open", "") : this.removeAttribute("open");
            } else {
              if (open && open.set) {
                return open.set.call(this, value);
              }
            }
          }
        },
        setAttribute: {
          value: function value(name, _value) {
            var _this = this;
            var call = function call() {
              return setAttribute.call(_this, name, _value);
            };
            if (name == "open" && this.tagName == "DETAILS") {
              var wasOpen = this.hasAttribute("open");
              var result = call();
              if (!wasOpen) {
                var summary = this.querySelector("summary");
                if (summary) {
                  var content = summary.nextElementSibling;
                  summary.setAttribute("aria-expanded", true);
                  content.setAttribute("aria-hidden", false);
                }
                triggerToggle(this);
              }
              return result;
            }
            return call();
          }
        },
        removeAttribute: {
          value: function value(name) {
            var _this2 = this;
            var call = function call() {
              return removeAttribute.call(_this2, name);
            };
            if (name == "open" && this.tagName == "DETAILS") {
              var wasOpen = this.hasAttribute("open");
              var result = call();
              if (wasOpen) {
                var summary = this.querySelector("summary");
                if (summary) {
                  var content = summary.nextElementSibling;
                  summary.setAttribute("aria-expanded", false);
                  content.setAttribute("aria-hidden", true);
                }
                triggerToggle(this);
              }
              return result;
            }
            return call();
          }
        }
      });
    };
    var polyfillToggle = function polyfillToggle() {
      onTogglingTrigger((function(element) {
        element.hasAttribute("open") ? element.removeAttribute("open") : element.setAttribute("open", "");
      }));
    };
    var polyfillToggleEvent = function polyfillToggleEvent() {
      if (window.MutationObserver) {
        new MutationObserver((function(mutations) {
          forEach.call(mutations, (function(mutation) {
            var target = mutation.target, attributeName = mutation.attributeName;
            if (target.tagName == "DETAILS" && attributeName == "open") {
              triggerToggle(target);
            }
          }));
        })).observe(document.documentElement, {
          attributes: true,
          subtree: true
        });
      } else {
        onTogglingTrigger((function(element) {
          var wasOpen = element.getAttribute("open");
          setTimeout((function() {
            var isOpen = element.getAttribute("open");
            if (wasOpen != isOpen) {
              triggerToggle(element);
            }
          }), 1);
        }));
      }
    };
    var polyfillAccessibility = function polyfillAccessibility() {
      setAccessibilityAttributes(document);
      if (window.MutationObserver) {
        new MutationObserver((function(mutations) {
          forEach.call(mutations, (function(mutation) {
            forEach.call(mutation.addedNodes, setAccessibilityAttributes);
          }));
        })).observe(document.documentElement, {
          subtree: true,
          childList: true
        });
      } else {
        document.addEventListener("DOMNodeInserted", (function(event) {
          setAccessibilityAttributes(event.target);
        }));
      }
    };
    var setAccessibilityAttributes = function setAccessibilityAttributes(root) {
      findElementsWithTagName(root, "SUMMARY").forEach((function(summary) {
        var details = findClosestElementWithTagName(summary, "DETAILS");
        var content = summary.nextSibling;
        summary.setAttribute("aria-expanded", details.hasAttribute("open"));
        if (!summary.hasAttribute("tabindex")) summary.setAttribute("tabindex", "0");
        if (!summary.hasAttribute("role")) summary.setAttribute("role", "button");
        if (content.nodeName === "#text") {
          var contentDiv = document.createElement("div");
          contentDiv.appendChild(content);
        }
        if (content.id && !summary.hasAttribute("aria-controls")) summary.setAttribute("aria-controls", content.id);
      }));
    };
    var eventIsSignificant = function eventIsSignificant(event) {
      return !(event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.target.isContentEditable);
    };
    var onTogglingTrigger = function onTogglingTrigger(callback) {
      addEventListener("click", (function(event) {
        if (eventIsSignificant(event)) {
          if (event.which <= 1) {
            var element = findClosestElementWithTagName(event.target, "SUMMARY");
            if (element && element.parentNode && element.parentNode.tagName == "DETAILS") {
              callback(element.parentNode);
            }
          }
        }
      }), false);
      addEventListener("keydown", (function(event) {
        if (eventIsSignificant(event)) {
          if (event.keyCode == 13 || event.keyCode == 32) {
            var element = findClosestElementWithTagName(event.target, "SUMMARY");
            if (element && element.parentNode && element.parentNode.tagName == "DETAILS") {
              callback(element.parentNode);
              event.preventDefault();
            }
          }
        }
      }), false);
    };
    var triggerToggle = function triggerToggle(element) {
      var event = document.createEvent("Event");
      event.initEvent("toggle", false, false);
      element.dispatchEvent(event);
    };
    var findElementsWithTagName = function findElementsWithTagName(root, tagName) {
      return (root.tagName == tagName ? [ root ] : []).concat(typeof root.getElementsByTagName == "function" ? slice.call(root.getElementsByTagName(tagName)) : []);
    };
    var findClosestElementWithTagName = function findClosestElementWithTagName(element, tagName) {
      if (typeof element.closest == "function") {
        return element.closest(tagName);
      } else {
        while (element) {
          if (element.tagName == tagName) {
            return element;
          } else {
            element = element.parentNode;
          }
        }
      }
    };
    var _ref = [], forEach = _ref.forEach, slice = _ref.slice;
    if (!support.open) {
      polyfillStyles();
      polyfillProperties();
      polyfillToggle();
      polyfillAccessibility();
    }
    if (support.open && !support.toggle) {
      polyfillToggleEvent();
    }
  }
})();
