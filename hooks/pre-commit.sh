#!/usr/bin/env bash

# récupération du répertoire git
git_wd=$(git rev-parse --show-toplevel)

# stash les modifications non ajoutées au staging area
git stash -q --keep-index

# exécuter les tests
$git_wd/hooks/run_tests.sh

# récupérer le résultat
RESULT=$?

# unstash les modifications
git stash pop -q

# renvoyer 1 si les tests ont échoué, 0 sinon
if [ $RESULT -ne 0 ];
then
	echo "Des erreurs ont été relevées, commit refusé"
	exit 1
else
	exit 0
fi
