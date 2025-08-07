#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

/**
 * Script de génération automatique du changelog
 * Compétence RNCP C4.3.2 - Journal des versions
 */

class ChangelogGenerator {
    constructor() {
        this.projectRoot = process.cwd()
        this.changelogPath = path.join(this.projectRoot, "CHANGELOG.md")
        this.packageJsonPath = path.join(this.projectRoot, "package.json")
    }

    /**
     * Récupérer la version actuelle du projet
     */
    getCurrentVersion() {
        try {
            const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, "utf8"))
            return packageJson.version
        } catch (error) {
            console.error("❌ Erreur lors de la lecture de package.json:", error.message)
            process.exit(1)
        }
    }

    /**
     * Récupérer le dernier tag Git
     */
    getLastTag() {
        try {
            return execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: "utf8" }).trim()
        } catch (error) {
            console.error("❌ Erreur lors de la récupération du dernier tag:", error.message)
            return ""
        }
    }

    /**
     * Récupérer les commits depuis le dernier tag
     */
    getCommitsSinceLastTag(lastTag) {
        try {
            let command
            if (lastTag) {
                command = `git log --oneline --pretty=format:"%h|%s|%an|%ad" --date=short ${lastTag}..HEAD`
            } else {
                command = 'git log --oneline --pretty=format:"%h|%s|%an|%ad" --date=short -20'
            }

            const commits = execSync(command, { encoding: "utf8" })
                .split("\n")
                .filter((line) => line.trim())
                .map((line) => {
                    const [hash, message, author, date] = line.split("|")
                    return { hash, message, author, date }
                })

            return commits
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des commits:", error.message)
            return []
        }
    }

    /**
     * Catégoriser les commits par type
     */
    categorizeCommits(commits) {
        const categories = {
            features: [],
            fixes: [],
            breaking: [],
            security: [],
            docs: [],
            chore: [],
            other: [],
        }

        commits.forEach((commit) => {
            const message = commit.message.toLowerCase()

            if (message.includes("breaking") || message.includes("major")) {
                categories.breaking.push(commit)
            } else if (message.includes("feat") || message.includes("feature") || message.includes("add")) {
                categories.features.push(commit)
            } else if (message.includes("fix") || message.includes("bug") || message.includes("correction")) {
                categories.fixes.push(commit)
            } else if (message.includes("security") || message.includes("vuln")) {
                categories.security.push(commit)
            } else if (message.includes("doc") || message.includes("readme")) {
                categories.docs.push(commit)
            } else if (message.includes("chore") || message.includes("ci") || message.includes("build")) {
                categories.chore.push(commit)
            } else {
                categories.other.push(commit)
            }
        })

        return categories
    }

    /**
     * Générer le contenu du changelog pour une version
     */
    generateVersionChangelog(version, date, categorizedCommits) {
        let changelog = `## [${version}] - ${date}\n\n`

        // Breaking changes
        if (categorizedCommits.breaking.length > 0) {
            changelog += "### ⚠️ Breaking Changes\n"
            categorizedCommits.breaking.forEach((commit) => {
                changelog += `- ${commit.message} (${commit.hash})\n`
            })
            changelog += "\n"
        }

        // Security fixes
        if (categorizedCommits.security.length > 0) {
            changelog += "### 🔒 Security\n"
            categorizedCommits.security.forEach((commit) => {
                changelog += `- ${commit.message} (${commit.hash})\n`
            })
            changelog += "\n"
        }

        // Features
        if (categorizedCommits.features.length > 0) {
            changelog += "### ✨ Added\n"
            categorizedCommits.features.forEach((commit) => {
                changelog += `- ${commit.message} (${commit.hash})\n`
            })
            changelog += "\n"
        }

        // Fixes
        if (categorizedCommits.fixes.length > 0) {
            changelog += "### 🐛 Fixed\n"
            categorizedCommits.fixes.forEach((commit) => {
                changelog += `- ${commit.message} (${commit.hash})\n`
            })
            changelog += "\n"
        }

        // Documentation
        if (categorizedCommits.docs.length > 0) {
            changelog += "### 📚 Documentation\n"
            categorizedCommits.docs.forEach((commit) => {
                changelog += `- ${commit.message} (${commit.hash})\n`
            })
            changelog += "\n"
        }

        // Other changes
        if (categorizedCommits.other.length > 0) {
            changelog += "### 🔧 Changed\n"
            categorizedCommits.other.forEach((commit) => {
                changelog += `- ${commit.message} (${commit.hash})\n`
            })
            changelog += "\n"
        }

        return changelog
    }

    /**
     * Mettre à jour le fichier CHANGELOG.md
     */
    updateChangelogFile(version, changelogContent) {
        try {
            let changelogContent = fs.readFileSync(this.changelogPath, "utf8")

            // Insérer la nouvelle version après [Unreleased]
            const unreleasedIndex = changelogContent.indexOf("## [Unreleased]")
            if (unreleasedIndex !== -1) {
                const beforeUnreleased = changelogContent.substring(0, unreleasedIndex)
                const afterUnreleased = changelogContent.substring(unreleasedIndex)

                changelogContent = beforeUnreleased + changelogContent + "\n" + afterUnreleased
            } else {
                // Si pas de section [Unreleased], ajouter au début
                changelogContent = changelogContent + "\n" + changelogContent
            }

            fs.writeFileSync(this.changelogPath, changelogContent)
            console.log("✅ CHANGELOG.md mis à jour avec succès")
        } catch (error) {
            console.error("❌ Erreur lors de la mise à jour du CHANGELOG.md:", error.message)
        }
    }

    /**
     * Créer un tag Git pour la version
     */
    createGitTag(version) {
        try {
            execSync(`git tag -a "v${version}" -m "Release v${version}"`, { stdio: "inherit" })
            console.log(`✅ Tag Git v${version} créé`)
        } catch (error) {
            console.error("❌ Erreur lors de la création du tag Git:", error.message)
        }
    }

    /**
     * Générer un rapport de release
     */
    generateReleaseReport(version, categorizedCommits) {
        const report = {
            version,
            date: new Date().toISOString().split("T")[0],
            summary: {
                breaking: categorizedCommits.breaking.length,
                security: categorizedCommits.security.length,
                features: categorizedCommits.features.length,
                fixes: categorizedCommits.fixes.length,
                docs: categorizedCommits.docs.length,
                other: categorizedCommits.other.length,
                total: Object.values(categorizedCommits).reduce((sum, commits) => sum + commits.length, 0),
            },
            commits: categorizedCommits,
        }

        const reportPath = path.join(this.projectRoot, `reports/release-report-${version}.json`)
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
        console.log(`📊 Rapport de release généré: ${reportPath}`)

        return report
    }

    /**
     * Méthode principale
     */
    generate() {
        console.log("🚀 Génération du changelog...\n")

        // Récupérer les informations
        const currentVersion = this.getCurrentVersion()
        const lastTag = this.getLastTag()
        const commits = this.getCommitsSinceLastTag(lastTag)

        console.log(`📦 Version actuelle: ${currentVersion}`)
        console.log(`🏷️  Dernier tag: ${lastTag || "Aucun"}`)
        console.log(`📝 Commits analysés: ${commits.length}\n`)

        if (commits.length === 0) {
            console.log("ℹ️  Aucun nouveau commit détecté")
            return
        }

        // Catégoriser les commits
        const categorizedCommits = this.categorizeCommits(commits)

        // Afficher le résumé
        console.log("📊 Résumé des changements:")
        Object.entries(categorizedCommits).forEach(([category, commits]) => {
            if (commits.length > 0) {
                console.log(`  ${category}: ${commits.length} commit(s)`)
            }
        })
        console.log("")

        // Utiliser la date du dernier commit pour plus de cohérence
        const lastCommitDate = commits.length > 0 ? commits[0].date : new Date().toISOString().split("T")[0]
        console.log(`📅 Date utilisée: ${lastCommitDate}`)

        const changelogContent = this.generateVersionChangelog(currentVersion, lastCommitDate, categorizedCommits)

        // Mettre à jour le fichier
        this.updateChangelogFile(currentVersion, changelogContent)

        // Créer le tag Git
        this.createGitTag(currentVersion)

        // Générer le rapport
        this.generateReleaseReport(currentVersion, categorizedCommits)

        console.log("\n🎉 Changelog généré avec succès !")
        console.log(`📄 Consultez le fichier: ${this.changelogPath}`)
    }
}

// Exécution du script
if (require.main === module) {
    const generator = new ChangelogGenerator()
    generator.generate()
}

module.exports = ChangelogGenerator
