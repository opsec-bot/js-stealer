{
  "targets": [
    {
      "target_name": "superpapi",
      "sources": [ "src/superpapi.cpp" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "include"
      ],
      'conditions': [
        ['OS == "win"', {
          "libraries": [
            "-lcrypt32.lib"
          ]
        }]
      ]
    }
  ]
}