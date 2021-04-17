import {execSync} from 'child_process'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs'
import YAML from 'yaml'

let buildNumber = Date.now()
let image = "sftp"
let tag =`${image}:${buildNumber}`

const BUILD_FOLDER = folder('./build')
const KUBER_BUILD_FOLDER = folder(`${BUILD_FOLDER}/minikube-${buildNumber}`)

clearOldImages(image)

processSpec('./minikube/sftp-deployment.yml',
            `${KUBER_BUILD_FOLDER}/sftp-deployment.yml`,
            (srcSpec) => srcSpec.spec.template.spec.containers[0].image = tag)
processSpec('./minikube/sftp-service.yml',
            `${KUBER_BUILD_FOLDER}/sftp-service.yml`)
processSpec('./minikube/sftp-volume.yml',
            `${KUBER_BUILD_FOLDER}/sftp-volume.yml`)
processSpec('./minikube/sftp-volumeclaim.yml',
            `${KUBER_BUILD_FOLDER}/sftp-volumeclaim.yml`)

exec(`docker build -t ${tag} .`)
exec(`minikube image load ${tag} `)
exec(`kubectl apply -f ${KUBER_BUILD_FOLDER}/sftp-volume.yml`)
exec(`kubectl apply -f ${KUBER_BUILD_FOLDER}/sftp-volumeclaim.yml`)
exec(`kubectl apply -f ${KUBER_BUILD_FOLDER}/sftp-deployment.yml`)
exec(`kubectl apply -f ${KUBER_BUILD_FOLDER}/sftp-service.yml`)

function clearOldImages(image) {
    let output = execSync('minikube image ls').toString()
    output.split('\n')
          .filter(s => s.includes(`docker.io/library/${image}:`))
          .forEach(s => {
            exec(`minikube image rm ${s}`)
          })
}

function exec(command) {
    console.log(`Execute: ${command}`)
    console.log("=============================================")
    
    let output = execSync(
        command,
        {stdio: 'inherit'}
    )  
    console.log("=============================================")  
    return output
}

function folder(path) {
    if (!existsSync(path)) {
        mkdirSync(path)
    }
    return path;
}

function processSpec(source, target, handler) {
    let sourceSpec = loadSpec(source)
    if (handler) {
        handler(sourceSpec)
    }
    storeSpec(target, sourceSpec)
}

function loadSpec(path) {
    const spec = readFileSync(path, 'utf8')
    let doc = YAML.parseDocument(spec).toJSON()
    return doc
}

function storeSpec(path, specJson) {
    const doc = new YAML.Document();
    doc.contents = specJson;
    writeFileSync(path, doc.toString())
}
