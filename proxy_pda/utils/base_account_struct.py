base_account_struct = [
    {
        'name':
        'Actif',
        'account_type':
        0,
        'virtual':
        True,
        'account_set': [
            {
                'name':
                'Actifs actuels',
                'account_type':
                0,
                'virtual':
                True,
                'account_set': [
                    {
                        'name': 'Chèques',
                        'account_type': 0,
                        'virtual': False,
                        'account_set': []
                    },
                    {
                        'name': 'Livret A',
                        'account_type': 0,
                        'virtual': False,
                        'account_set': []
                    },
                    {
                        'name': 'Monnaie',
                        'account_type': 0,
                        'virtual': False,
                        'account_set': []
                    },
                    {
                        'name': 'Compte Courant',
                        'account_type': 0,
                        'virtual': False,
                        'account_set': []
                    },
                ]
            },
        ]
    },
    {
        'name':
        'Passif',
        'account_type':
        1,
        'virtual':
        True,
        'account_set': [
            {
                'name': 'Comptes de dettes',
                'account_type': 1,
                'virtual': True,
                'account_set': []
            },
        ]
    },
    {
        'name':
        'Revenus',
        'account_type':
        2,
        'virtual':
        True,
        'account_set': [
            {
                'name': 'Subventions reçues',
                'account_type': 2,
                'virtual': False,
                'account_set': []
            },
        ]
    },
    {
        'name':
        'Dépenses',
        'account_type':
        3,
        'virtual':
        True,
        'account_set': [
            {
                'name': 'Communication',
                'account_type': 3,
                'virtual': True,
                'account_set': []
            },
        ]
    },
    {
        'name': 'Capitaux propres',
        'account_type': 4,
        'virtual': False,
        'account_set': []
    },
]
