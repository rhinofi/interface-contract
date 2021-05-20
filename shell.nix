let
  pkgs = import <nixpkgs> {};
in
  pkgs.mkShell {
    name = "node";
    buildInputs = [
        pkgs.jq
        pkgs.nodejs-10_x
        pkgs.direnv
        pkgs.yarn
        pkgs.z3
        (pkgs.callPackage(import ./nix/ethGo.nix) {})
        # (pkgs.callPackage(import ./nix/solc.nix) {})
    ];
  }
