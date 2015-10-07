var zen_controller = (function(){
	return {
		/**
		 * Runs Zen Coding action
		 * @param {String} name Action name
		 */
		runAction: function(name) {
			try {
				zen_editor.setContext();
				if (name == 'wrap_with_abbreviation') {
					var abbr = prompt('Enter abbreviation:');
					if (abbr)
						return zen_coding.runAction(name, zen_editor, abbr);
				} else {
					return zen_coding.runAction(name, zen_editor);
				}
			} catch(e) {}
		}
	}
})();