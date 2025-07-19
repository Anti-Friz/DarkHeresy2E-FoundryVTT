$source      = ".\release\css"
$destination = ".\css"

if (Test-Path $destination) {
    Remove-Item $destination -Recurse -Force
}

Copy-Item -Path $source -Destination $destination -Recurse