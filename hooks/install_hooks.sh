#!/bin/bash

# récupération du réperoire git
git_wd=$(git rev-parse --show-toplevel)

# on va remplacer le script pre-commit dans le répertoire .git/hooks
if [ -f $git_wd/.git/hooks/pre-commit ];
then
	rm $git_wd/.git/hooks/pre-commit
fi

# lien symbolique
ln -s $git_wd/hooks/pre-commit.sh $git_wd/.git/hooks/pre-commit
chmod +x $git_wd/hooks/pre-commit.sh
