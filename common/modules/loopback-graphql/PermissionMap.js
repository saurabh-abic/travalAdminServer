const USERID = { key: 'id', contextKey: 'id' };

const tablePermissionMap = {
	publicRoutes: [
		"UserdataLogin",
		"UserdataResetPassword"
	],
	city: {
		list: {
			admin: [],
		}
	},
	country: {
		list: {
			admin: [],
		}
	},
	emailtemplate: {
		list: {
			admin: []
		},
		edit: {
			admin: []
		},
	},
	site: {
		list: {
			admin: [],
		},
		add: {
			admin: []
		},
		edit: {
			admin: []
		},
		delete: {
			admin: []
		}
	},
	state: {
		list: {
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		}
	},
	userdata: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	customer: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	address: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	contactdetails: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	customerindustries: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	industry: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	state: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	country: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	role: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	module: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	roleprivileges: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
	userprivileges: {
		list: {
			0: [],
			1: [],
			admin: [],
			physician: [],
			assistant: [],
			salesrep: []
		},
		add: {
			0: [],
			1: [],
			admin: []
		},
		edit: {
			0: [],
			1: [],
			admin: []
		},
		delete: {
			0: [],
			1: [],
			admin: []
		}
	},
    categories:{
        list: {
            0: [],
            1: [],
            admin: [],
            physician: [],
            assistant: [],
            salesrep: [],
            public:[]
        },
        add: {
            0: [],
            1: [],
            admin: []
        },
        edit: {
            0: [],
            1: [],
            admin: []
        },
        delete: {
            0: [],
            1: [],
            admin: []
        }
	},
    category:{
        list: {
            0: [],
            1: [],
            admin: [],
            physician: [],
            assistant: [],
            salesrep: [],
            public:[]
        },
        add: {
            0: [],
            1: [],
            admin: []
        },
        edit: {
            0: [],
            1: [],
            admin: []
        },
        delete: {
            0: [],
            1: [],
            admin: []
        }
    }
};

module.exports = {
	tablePermissionMap
}