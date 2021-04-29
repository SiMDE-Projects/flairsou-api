#!/usr/bin/env bash

# fonction de test pour les fichiers python
test_python_file()
{
	# le nom du fichier doit être passé en paramètre
	filename=$1
	filepath="$(git rev-parse --show-toplevel)/$filename"

	# par défaut, les tests sont valides (retour 0)
	local testsOK=0

	# vérification des erreurs de syntaxe / sémantique avec pyflakes
	pyflakes $filepath

	if [ $? -ne 0 ];
	then
		echo "Pyflakes a trouvé des erreurs dans le fichier $filename"
		testsOK=1
	fi

	# vérification de la mise en forme avec yapf
	yapf -d $filepath > /dev/null

	if [ $? -ne 0 ];
	then
		echo "Le fichier $filename n'est pas bien formaté, utiliser yapf pour corriger."
		testsOK=1
	fi

	return $testsOK
}

# fonction de test pour les fichier js/jsx
test_js_file()
{
	# Il faut être dans le dossier flairsou_frontend
	cd "$(git rev-parse --show-toplevel)/flairsou_frontend"

	filename=$1
	# Le filepath est relatif à la racine du repo
	filepath="../$1"

	local testOK=0

	npx eslint $filepath

	if [ $? -ne 0 ];
	then
		echo "Eslint a trouvé des erreurs dans le fichier $filename"
		testsOK=1
	fi

	return $testOK
}

echo "Lancement des tests pré-commit..."

# récupérer les fichiers ajoutés au staging area
files=$(git status --porcelain | sed -e 's/^...\(.*\)$/\1/g')

# par défaut, les tests sont valides (donc retour 0)
testsOK=0

# tester chaque fichier ajouté
# le principe est de tester tous les fichiers pour afficher toutes les erreurs
# avant de renvoyer la valeur
for file in $files
do
	# on ne commit pas la configuration privée !
	if [ "$file" == "flairsou/config.py" ];
	then
		echo "-> ERREUR : Le fichier $file ne doit pas être commit !!!!"
		testsOK=1
	fi

	# récupération de l'extension du fichier
	extension=$(echo $file | cut -f 2 -d '.')

	case $extension in
		py)
			# tests pour les fichiers python
			test_python_file $file
			;;
		js | jsx)
			test_js_file $file
			;;
		*)
			;;
	esac

	if [ $? -ne 0 ];
	then
		# erreurs dans les tests, on change le retour final
		testsOK=1
	fi
done

# retourner le résultat des tests
exit $testsOK
