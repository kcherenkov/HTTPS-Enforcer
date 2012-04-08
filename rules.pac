var direct = 'DIRECT';
var proxy = 'PROXY 107.21.118.110:8080; DIRECT';
var targets = [];
var rule_set = null;

function Rule(from, to) {
  this.from = from;
  this.to = to;
  this.from_c = new RegExp(from);
}

function Exclusion(pattern) {
  this.pattern = pattern;
  this.pattern_c = new RegExp(pattern);
}

function RuleSet(name, match_rule) {
  this.name = name;
  if (match_rule)
    this.ruleset_match_c = new RegExp(match_rule);
  else
    this.ruleset_match_c = null;
  this.rules = [];
  this.exclusions = [];
}

RuleSet.prototype = {
  isApplicable: function(urispec) {
    // If a rulset has a match_rule and it fails, go no further
    if (this.ruleset_match_c && !this.ruleset_match_c.test(urispec)) {
      return false;
    }
    // Even so, if we're covered by an exclusion, go home
    for(i = 0; i < this.exclusions.length; ++i) {
      if (this.exclusions[i].pattern_c.test(urispec)) {
        return false;
      }
    }
    // Okay, now find the first rule that triggers
    var returl = null;
    for(i = 0; i < this.rules.length; ++i) {
      returl = urispec.replace(this.rules[i].from_c,
                               this.rules[i].to);
      if (returl != urispec) {
        return true;
      }
    }
  }
};

function FindProxyForURL(urispec, host)
{
  if (urispec.substring(0, 5) !== 'http:')  //check protocol
    return direct;
  
  if (isPlainHostName(host))  //check if there are dots in hostname
    return direct;
  
  if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(host)) // check for ip address
    return direct;
  
  var i, k, tmp, t;
  if (targets[host])
  {
    for (k = 0; k < targets[host].length; ++k)
    {
      if (targets[host][k].isApplicable(urispec))
       return proxy;
    }
  }
  // replace each portion of the domain with a * in turn
  var segmented = host.split(".");
  for (i = 0; i < segmented.length; ++i) {
    tmp = segmented[i];
    segmented[i] = "*";
    t = segmented.join(".");
    segmented[i] = tmp;
    if (targets[t])
    {
      for (k = 0; k < targets[t].length; ++k)
      {
        if(targets[t][k].isApplicable(urispec))
          return proxy;
      }
    }
  }
  // now eat away from the left, with *, so that for x.y.z.google.com we
  // check *.z.google.com and *.google.com (we did *.y.z.google.com above)
  for (i = 1; i < segmented.length - 2; ++i) {
    t = "*." + segmented.slice(i,segmented.length).join(".");
    if (targets[t])
    {
      for (k = 0; k < targets[t].length; ++k)
      {
        if(targets[t][k].isApplicable(urispec))
          return proxy;
      }
    }
  }
  return direct;
}
