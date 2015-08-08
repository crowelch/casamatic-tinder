/*jslint browser: true*/
/*global console, Hammer, $*/

/**
 * Tindercards.js
 *
 * @author www.timo-ernst.net
 * @module Tindercardsjs
 * License: MIT
 */
var Tindercardsjs = Tindercardsjs || {};

Tindercardsjs = (function () {
  'use strict';

  var exports = {};

  /**
   * Represents one card
   *
   * @memberof module:Tindercardsjs
   * @class
   */
  exports.card = function (cardid, name, desc, imgpath) {

    var jqo;
    /**
     * Returns a jQuery representation of this card
     *
     * @method
     * @public
     * @return {object} A jQuery representation of this card
     */
    this.tojQuery = function () {
      if (!jqo) {
        jqo = $('<div class="tc-card">').attr('data-cardid', cardid).html('<div class="tc-card-img-cont"><img src="' + imgpath + '" class="tc-card-img"><div class="tc-card-body"><h2 class="tc-card-name">' + name + '</h2><span class="tc-card-desc">' + desc + '</span></div></div>');
      }
      return jqo;
    };

  };

  /**
   * Initializes swipe
   *
   * @private
   * @function
   */
  function initSwipe(onSwiped) {
    var $topcard = $('.tc-card'),
      deltaX = 0;

    $topcard.each(function () {

      var $card = $(this);

      (new Hammer(this)).on("panleft panright panend panup pandown", function (ev) {
        var transform,
          yfactor = ev.deltaX >= 0 ? -1 : 1,
          resultEvent = {};

        if (ev.type === 'panend') {
          if (deltaX > 100 || deltaX < -100) {
            transform = 'translate3d(' + (5 * deltaX) + 'px, ' + (yfactor * 1.5 * deltaX) + 'px, 0)';
            $card.css({
              'transition': '-webkit-transform 0.5s',
              '-webkit-transform': transform + ' rotate(' + ((-5 * deltaX) / 10) + 'deg)'
            });
            setTimeout(function () {
              $card.css({
                'display': 'none'
              });
              if (typeof onSwiped === 'function') {
                resultEvent.cardid = $card.attr('data-cardid');
                resultEvent.card = $card;
                if (deltaX > 100) {
                  resultEvent.direction = 'right';
                } else {
                  resultEvent.direction = 'left';
                }
                onSwiped(resultEvent);
              } else {
                console.warn('onSwipe callback does not exist!');
              }
            }, 500);
          } else {
            transform = 'translate3d(0px, 0, 0)';
            $card.css({
              'transition': '-webkit-transform 0.3s',
              '-webkit-transform': transform + ' rotate(0deg)'
            });
            setTimeout(function () {
              $card.css({
                'transition': '-webkit-transform 0s'
              });
            }, 300);
          }
        } else if (ev.type === 'panup' || ev.type === 'pandown') {
          // No vertical scroll
          ev.preventDefault();
        } else {
          deltaX = ev.deltaX;

          transform = 'translate3d(' + deltaX + 'px, ' + (yfactor * 0.15 * deltaX) + 'px, 0)';

          $card.css({
            '-webkit-transform': transform + ' rotate(' + ((-1 * deltaX) / 10) + 'deg)'
          });
        }


      });
    });
  }

  /**
   * Renders the given cards
   *
   * @param {array} cards The cards (must be instanceof Tindercardsjs.card)
   * @param {jQuery} $target The container in which the cards should be rendered into
   * @param {function} onSwiped Callback when a card was swiped
   * @example Tindercardsjs.render(cards, $('#main'));
   * @method
   * @public
   * @memberof module:Tindercardsjs
   */
  exports.render = function (cards, $target, onSwiped) {
    var i,
      $card;

    if (cards) {
      for (i = 0; i < cards.length; i = i + 1) {
        $card = cards[i].tojQuery().appendTo($target).css({
          'position': 'absolute',
          'border': '15px solid #b1fff5',
          'border-radius': '3px',
          'background-color': 'white',
          'opacity': '100%',
          'height': '100%',
          'left': '10px',
          'top': '10px',
          'right': '10px',
        });

        $card.find('.tc-card-img').css({
          'width': '100%',
          'margin': '0 auto'
        });

        $card.find('.tc-card-name').css({
          'margin-top': '0',
          'margin-bottom': '5px',
          'color': '#FF6019'
        });

        $card.find('.tc-card-body').css({
          'position': 'relative',
          'left': '10px',
          'width': '280px',
          'height': '100%'
        });

      }

      initSwipe(onSwiped);

    } else {
      console.warn('tindercards array empty, no cards will be displayed');
    }
  };

  return exports;

}());

var rocks;

$(document).ready(function () {
  var newCard;
  $.ajax({
    url: 'http://localhost:3000/api/getHouses',
    dataType: 'json',
    success: function(response) {
      console.log(response)
      makeCard(response);
    }
  });

  var cards = [];

  function makeCard(data) {

    data.forEach(function (elem, ind) {
      newCard = new Tindercardsjs.card(cards.length, elem.Title, elem.Description, elem.Photos[0].Url, elem);
      newCard.orig = elem;
      cards.push(newCard);
    });

    render();
  }

  function render() {
    // Render cards
    Tindercardsjs.render(cards, $('#main'), function (event) {

      console.log(event.card);
    });
  }
});
