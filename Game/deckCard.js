/**
 * @author pjnovas
 */

function DeckCard(suit, number){
	this.number = number;
	this.suit = suit;
	
	var me = this;
	function getValue () {
		switch(me.number){
			case 1: return 11;
			case 3: return 10;
			case 12: return 4;
			case 11: return 3;
			case 10: return 2;
			default: return 0;
		}
	}
	
	this.value = getValue();
}

exports.DeckCard = DeckCard;