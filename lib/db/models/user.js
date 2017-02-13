module.exports = function(sequelize, DataTypes) {
	return sequelize.define("User", {
		// this is a problem, we are making this key unique except it comes
		// possibly many foreign sources. We need to re address this.
		username: {
			type: DataTypes.STRING,
			unique: true
		},
		
	}, {
		classMethods: {
			associate: function(models) { }
		},
		instanceMethods: {
			toCache: function() {
				return {
					id: this.id,
					name: this.username
				};
			}
		}
	});
};
