var direct = 'DIRECT';
var proxy = 'PROXY 107.21.118.110:8080; DIRECT';
var T = [];
var R = null;

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

function a (host)
{
  if (!T.hasOwnProperty(host))
    T[host] = [];
  T[host].push(R);
}

function FindProxyForURL(urispec, host)
{
  if (urispec.substring(0, 5) !== 'http:')  //check protocol
    return direct;
  
  if (isPlainHostName(host))  //check if there are dots in hostname
    return direct;
  
  if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(host)) // check for ip address
    return direct;
  
  var i, k, tmp, t;
  if (T[host])
  {
    for (k = 0; k < T[host].length; ++k)
    {
      if (T[host][k].isApplicable(urispec))
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
    if (T[t])
    {
      for (k = 0; k < T[t].length; ++k)
      {
        if(T[t][k].isApplicable(urispec))
          return proxy;
      }
    }
  }
  // now eat away from the left, with *, so that for x.y.z.google.com we
  // check *.z.google.com and *.google.com (we did *.y.z.google.com above)
  for (i = 1; i < segmented.length - 2; ++i) {
    t = "*." + segmented.slice(i,segmented.length).join(".");
    if (T[t])
    {
      for (k = 0; k < T[t].length; ++k)
      {
        if(T[t][k].isApplicable(urispec))
          return proxy;
      }
    }
  }
  return direct;
}
R = new RuleSet("100-gute-gruende.de");
R.rules.push(new Rule("^http://(www\\.)?100-gute-gruende\\.de/", "https://www.100-gute-gruende.de/"));
a("www.100-gute-gruende.de");
a("100-gute-gruende.de");

R = new RuleSet("1177.se");
R.rules.push(new Rule("^http://1177\\.se/", "https://www.1177.se/"));
R.rules.push(new Rule("^http://www\\.1177\\.se/", "https://www.1177.se/"));
a("1177.se");
a("www.1177.se");

R = new RuleSet("123-reg");
R.rules.push(new Rule("^http://(\\w+\\.)?123-reg\\.co\\.uk/", "https://$1123-reg.co.uk/"));
a("123-reg.co.uk");
a("www.123-reg.co.uk");

R = new RuleSet("123systems");
R.rules.push(new Rule("^http://(www\\.)?123systems\\.net/", "https://123systems.net/"));
a("123systems.net");
a("www.123systems.net");

R = new RuleSet("1Cart");
R.rules.push(new Rule("^http://(www\\.)?1cart\\.co(?:m|\\.nz)/", "https://$11cart.co.nz/"));
R.rules.push(new Rule("^http://resellers\\.1cart\\.com/", "https://resellers.1cart.com/"));
a("1cart.com");
a("*.1cart.com");
a("1cart.co.nz");
a("www.1cart.co.nz");

R = new RuleSet("1&1 Internet");
R.rules.push(new Rule("^(http://(www\\.)?|https://www\\.)1and1\\.com/", "https://order.1and1.com/"));
R.rules.push(new Rule("^http://(admin|forum|mailxchange|mywebsite|mywebsitepersonal|order|password|redirect|shop)\\.1and1\\.com/", "https://$1.1and1.com/"));
R.rules.push(new Rule("^http://webmailcluster\\.perfora\\.net/", "https://webmailcluster.perfora.net/"));
R.rules.push(new Rule("^https?://(www\\.)?1and1\\.co\\.uk/", "https://order.1and1.co.uk/"));
R.rules.push(new Rule("^http://(admin|mailxchange|mywebsite|mywebsitepersonal|online-office|order|password|redirect|shop|webmailcluster)\\.1and1\\.co\\.uk/", "https://$1.1and1.co.uk/"));
R.rules.push(new Rule("^https?://(www\\.)?1and1\\.ca/", "https://order.1and1.ca/"));
R.rules.push(new Rule("^http://(admin|mywebsitepersonal|online-office|order|password)\\.1and1\\.ca/", "https://$1.1and1.ca/"));
R.rules.push(new Rule("^http://mywebsite\\.1and1\\.ca/tariff($|;)", "https://mywebsite.1and1.ca/tariff$1"));
a("1and1.com");
a("admin.1and1.com");
a("forum.1and1.com");
a("mailxchange.1and1.com");
a("mywebsite.1and1.com");
a("mywebsitepersonal.1and1.com");
a("order.1and1.com");
a("password.1and1.com");
a("redirect.1and1.com");
a("shop.1and1.com");
a("www.1and1.com");
a("webmailcluster.perfora.net");
a("1and1.co.uk");
a("admin.1and1.co.uk");
a("mailxchange.1and1.co.uk");
a("mywebsite.1and1.co.uk");
a("mywebsitepersonal.1and1.co.uk");
a("online-office.1and1.co.uk");
a("order.1and1.co.uk");
a("password.1and1.co.uk");
a("redirect.1and1.co.uk");
a("shop.1and1.co.uk");
a("webmailcluster.1and1.co.uk");
a("www.1and1.co.uk");
a("1and1.ca");
a("admin.1and1.ca");
a("mywebsite.1and1.ca");
a("mywebsitepersonal.1and1.ca");
a("online-office.1and1.ca");
a("order.1and1.ca");
a("password.1and1.ca");
a("www.1and1.ca");

R = new RuleSet("1f0.de (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?1f0\\.de/wp-content/", "https://www.1f0.de/wp-content/"));
a("1f0.de");
a("www.1f0.de");

R = new RuleSet("1NightStandStory");
R.rules.push(new Rule("^http://(?:www\\.)?1nightstandstory\\.com/", "https://www.1nightstandstory.com/"));
a("1nightstandstory.com");
a("www.1nightstandstory.com");

R = new RuleSet("1time.co.za");
R.rules.push(new Rule("^http://(?:www\\.)?1time\\.aero/", "https://www.1time.aero/"));
a("1time.aero");
a("www.1time.aero");

R = new RuleSet("2020mobile");
R.rules.push(new Rule("^http://(www\\.)?2020mobile\\.es/", "https://www.2020mobile.es/"));
a("www.2020mobile.es");
a("2020mobile.es");

R = new RuleSet("24 ways (partial)");
R.rules.push(new Rule("^http://(?:cloud|media)\\.24ways\\.org/", "https://s3.amazonaws.com/media.24ways.org/"));
a("cloud.24way.org");
a("media.24way.org");

R = new RuleSet("2o7.net");
R.rules.push(new Rule("^http://2o7\\.net/", "https://2o7.net/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)(\\.1[12]2)?\\.2o7\\.net/", "https://$1$2.2o7.net/"));
a("2o7.net");
a("*.2o7.net");
a("*.112.2o7.net");
a("*.122.2o7.net");

R = new RuleSet("33Across (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?33across\\.com/", "https://$133across.com/"));
R.exclusions.push(new Exclusion("^http://socialdna\\."));
a("33across.com");
a("*.33across.com");

R = new RuleSet("37Signals");
R.rules.push(new Rule("^http://(?:www\\.)?37signals\\.com/", "https://37signals.com/"));
R.rules.push(new Rule("^http://(gettingreal|launchpad|smiley)\\.37signals\\.com/", "https://$1.37signals.com/"));
a("37signals.com");
a("www.37signals.com");
a("gettingreal.37signals.com");
a("launchpad.37signals.com");
a("smiley.37signals.com");

R = new RuleSet("38.de");
R.rules.push(new Rule("^http://(?:www\\.)?38\\.de/", "https://www.38.de/"));
a("www.38.de");
a("38.de");

R = new RuleSet("3DStats");
R.rules.push(new Rule("^http://(www\\.)?3dstats\\.com/", "https://$13dstats.com/"));
a("3dstats.com");
a("www.3dstats.com");

R = new RuleSet("3cdn");
R.rules.push(new Rule("^http://(\\w+\\.)?3cdn\\.net/", "https://s3.amazonaws.com/$13cdn.net/"));
a("3cdn.net");
a("*.3cdn.net");

R = new RuleSet("3min");
R.rules.push(new Rule("^http://(?:www\\.)?3min\\.de/", "https://www.3min.de/"));
a("3min.de");
a("*.3min.de");
a("www.3min.de");

R = new RuleSet("451 Group");
R.rules.push(new Rule("^http://(www\\.)?451research\\.com/", "https://$1451research.com/"));
a("451research.com");
a("www.451research.com");

R = new RuleSet("4Shared (experimental)");
R.rules.push(new Rule("^http://4shared\\.com/", "https://www.4shared.com/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.4shared\\.com/", "https://$1.4shared.com/"));
R.exclusions.push(new Exclusion("^http://(blog|forum)\\.4shared\\.com/"));
a("4shared.com");
a("*.4shared.com");

R = new RuleSet("4Tulemar");
R.rules.push(new Rule("^http://(resources\\.|www\\.)?4tulemar\\.com/", "https://$14tulemar.com/"));
a("4tulemar.com");
a("*.4tulemar.com");

R = new RuleSet("4chan (partial)");
R.rules.push(new Rule("^http://((boards|images|rs|static|sys|(\\d\\.)?thumbs|www)\\.)?4chan\\.org/", "https://$14chan.org/"));
a("4chan.org");
a("*.4chan.org");
a("*.boards.4chan.org");
a("*.thumbs.4chan.org");

R = new RuleSet("4sevens");
R.rules.push(new Rule("^http://(?:www\\.)?4sevens\\.com/", "https://www.4sevens.com/"));
a("www.4sevens.com");
a("4sevens.com");

R = new RuleSet("7chan");
R.rules.push(new Rule("^http://(?:www\\.)?7chan\\.org/", "https://7chan.org/"));
a("7chan.org");
a("www.7chan.org");

R = new RuleSet("99.se");
R.rules.push(new Rule("^http://99\\.se/", "https://www.99.se/"));
R.rules.push(new Rule("^http://www\\.99\\.se/", "https://www.99.se/"));
a("99.se");
a("www.99.se");

R = new RuleSet("9gag");
R.rules.push(new Rule("^http://(www\\.)?9gag\\.com/", "https://9gag.com/"));
a("9gag.com");
a("www.9gag.com");

R = new RuleSet("9seeds (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?9seeds\\.com/", "https://d3j03r5zbavjdk.cloudfront.net/"));
a("9seeds.com");

R = new RuleSet("FSDN.com");
R.rules.push(new Rule("^http://a\\.fsdn\\.com/", "https://a.fsdn.com/"));
a("a.fsdn.com");

R = new RuleSet("a2z, Inc (partial)");
R.rules.push(new Rule("^http://(\\w+)\\.a2zinc\\.net/", "https://$1.a2zinc.net/"));
R.exclusions.push(new Exclusion("http://www\\..+/$"));
R.exclusions.push(new Exclusion(".+\\.aspx$"));
a("*.a2zinc.net");

R = new RuleSet("American Airlines");
R.rules.push(new Rule("^http://(ox-d\\.|www\\.)aa\\.com/", "https://$1aa.com/"));
a("aa.com");
a("*.aa.com");
a("*.www.aa.com");

R = new RuleSet("ABC Online (partial)");
R.rules.push(new Rule("^http://shop\\.abc\\.net\\.au/", "https://shop.abc.net.au/"));
R.rules.push(new Rule("^http://(?:www\\.)?abccomercial\\.com/", "https://abccomercial.com/"));
a("shop.abc.net.au");
a("abccommercial.com");
a("*.abccommercial.com");

R = new RuleSet("ABIS-Studien.se");
R.rules.push(new Rule("^http://www\\.abis-studien\\.se/", "https://www.abis-studien.se/"));
R.rules.push(new Rule("^http://abis-studien\\.se/", "https://abis-studien.se/"));
a("abis-studien.se");
a("www.abis-studien.se");

R = new RuleSet("ABN AMRO Bank");
R.rules.push(new Rule("^http://(?:www\\.)?abnamro\\.nl/", "https://www.abnamro.nl/"));
a("www.abnamro.nl");
a("abnamro.nl");

R = new RuleSet("ACLU of North Carolina");
R.rules.push(new Rule("^http://(?:www\\.)?aclu(?:ofnc|ofnorthcarolina)\\.org/", "https://www.acluofnorthcarolina.org/"));
a("acluofnorthcarolina.org");
a("www.acluofnorthcarolina.org");
a("acluofnc.org");
a("www.acluofnc.org");

R = new RuleSet("ACLU of Southern California");
R.rules.push(new Rule("^http://(?:www\\.)?aclu-sc\\.org/", "https://www.aclu-sc.org/"));
a("aclu-sc.org");
a("www.aclu-sc.org");

R = new RuleSet("ACLU of Virginia");
R.rules.push(new Rule("^(http://(www\\.)?|(https://www\\.))acluva\\.org/", "https://acluva.org/"));
a("acluva.org");
a("www.acluva.org");

R = new RuleSet("ACLU");
R.rules.push(new Rule("^http://aclu\\.org/", "https://www.aclu.org/"));
R.rules.push(new Rule("^http://(secure|www)\\.aclu\\.org/", "https://$1.aclu.org/"));
a("aclu.org");
a("*.aclu.org");

R = new RuleSet("ACM.org");
R.rules.push(new Rule("^http://campus\\.acm\\.org/", "https://campus.acm.org/"));
R.rules.push(new Rule("^http://portal\\.acm\\.org/", "https://portal.acm.org/"));
R.rules.push(new Rule("^http://queue\\.acm\\.org/", "https://queue.acm.org/"));
R.rules.push(new Rule("^http://techpack\\.acm\\.org/", "https://techpack.acm.org/"));
R.rules.push(new Rule("^http://acm\\.org/", "https://www.acm.org/"));
R.rules.push(new Rule("^http://www\\.acm\\.org/", "https://www.acm.org/"));
R.rules.push(new Rule("^http://dl\\.acm\\.org/", "https://dl.acm.org/"));
a("campus.acm.org");
a("portal.acm.org");
a("queue.acm.org");
a("techpack.acm.org");
a("acm.org");
a("www.acm.org");
a("dl.acm.org");

R = new RuleSet("Attention Deficit Disorders Association - Southern Region");
R.rules.push(new Rule("^http://(www\\.)?adda-sr\\.org/", "https://www.adda-sr.org/"));
a("adda-sr.org");
a("www.adda-sr.org");

R = new RuleSet("AJC.com");
R.rules.push(new Rule("^http://ajc\\.com/", "https://www.ajc.com/"));
R.rules.push(new Rule("^http://www\\.ajc\\.com/", "https://www.ajc.com/"));
a("ajc.com");
a("www.ajc.com");

R = new RuleSet("AK-Vorrat");
R.rules.push(new Rule("^http://(?:www\\.)?vorratsdatenspeicherung\\.de/", "https://www.vorratsdatenspeicherung.de/"));
R.rules.push(new Rule("^http://wiki\\.vorratsdatenspeicherung\\.de/", "https://wiki.vorratsdatenspeicherung.de/"));
a("vorratsdatenspeicherung.de");
a("www.vorratsdatenspeicherung.de");
a("wiki.vorratsdatenspeicherung.de");

R = new RuleSet("Aldi - Germany");
R.rules.push(new Rule("^https?://(?:www\\.)?\\aldisued\\.de/", "https://www.aldi-sued.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?\\aldi-sued\\.de/", "https://www.aldi-sued.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?\\aldi-nord\\.de/", "https://www.aldi-nord.de/"));
R.rules.push(new Rule("^https?://(?:www\\.)?\\aldinord\\.de/", "https://www.aldi-nord.de/"));
a("www.aldisued.de");
a("www.aldi-sued.de");
a("aldisued.de");
a("aldi-sued.de");
a("www.aldi-nord.de");
a("www.aldinord.de");
a("aldi-nord.de");
a("aldinord.de");

R = new RuleSet("ANB");
R.rules.push(new Rule("^http://anb\\.com\\.sa/", "https://www.anb.com.sa/"));
R.rules.push(new Rule("^http://(e|ebusiness|onlinebanking|www)\\.anb\\.com\\.sa/", "https://$1.anb.com.sa/"));
a("anb.com.sa");
a("*.anb.com.sa");

R = new RuleSet("ANZ");
R.rules.push(new Rule("^http://(?:www\\.)?anz\\.com/", "https://www.anz.com/"));
a("anz.com");
a("www.anz.com");

R = new RuleSet("AOK");
R.rules.push(new Rule("^http://(?:www\\.)?aok\\.de/", "https://www.aok.de/"));
a("www.aok.de");
a("aok.de");

R = new RuleSet("AOL (partial)");
R.rules.push(new Rule("^http://(adserver|aka-cdn(?:-ns)|(helios)?iq)\\.adtechus\\.com/", "https://$1.adtechus.com/"));
R.rules.push(new Rule("^http://(?:secure\\.)?leadback\\.advertising\\.com/", "https://secure.leadback.advertising.com/"));
R.rules.push(new Rule("^http://(?:cdn\\.|www\\.)?aim\\.com/", "https://www.aim.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?aol\\.com/(favicon\\.ico|video/)", "https://www.aol.com/$1"));
R.rules.push(new Rule("^http://((dev\\.sandbox\\.)?autos|bill|misc\\.blogsmith|contactus|account\\.login|(api\\.|cdn\\.web)mail|myaccount|new|openid|pki-info|aolctoftp\\.red|s2c|(api|my)\\.screenname|dashboard\\.voice)\\.aol\\.com/", "https://$1.aol.com/"));
R.rules.push(new Rule("^http://(?:exp)?api\\.oscar\\.aol\\.com/", "https://api.oscar.aol.com/"));
R.rules.push(new Rule("^http://aol\\.co\\.uk/", "https://www.aol.co.uk/"));
R.rules.push(new Rule("^http://(rs|www)\\.aol\\.co\\.uk/", "https://$1.aol.co.uk/"));
R.rules.push(new Rule("^http://o\\.aolcdn\\.com/", "https://s.aolcdn.com/"));
R.rules.push(new Rule("^http://s(ns-static)?\\.aolcdn\\.com/", "https://s$1.aolcdn.com/"));
R.rules.push(new Rule("^http://(ar|tacoda\\.at)\\.atwola\\.com/", "https://$1.atwola.com/"));
R.exclusions.push(new Exclusion("^http://o\\.aolcdn\\.com/(myfeeds|portaleu)/"));
a("*.adtechus.com");
a("*.adserver.adtechus.com");
a("leadback.advertising.com");
a("secure.leadback.advertising.com");
a("aim.com");
a("*.aim.com");
a("aol.com");
a("*.aol.com");
a("misc.blogsmith.aol.com");
a("account.login.aol.com");
a("api.mail.aol.com");
a("*.oscar.aol.com");
a("aolctoftp.red.aol.com");
a("dev.sandbox.autos.aol.com");
a("api.screenname.aol.com");
a("my.screenname.aol.com");
a("cdn.webmail.aol.com");
a("dashboard.voice.aol.com");
a("aol.co.uk");
a("*.aol.co.uk");
a("*.aolcdn.com");
a("ar.atwola.com");
a("tacoda.at.atwola.com");

R = new RuleSet("APA.org (partial)");
R.rules.push(new Rule("^http://my\\.apa\\.org/", "https://my.apa.org/"));
a("my.apa.org");

R = new RuleSet("ARPNetworks.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?(portal\\.)?arpnetworks\\.com/", "https://$2arpnetworks.com/"));
a("arpnetworks.com");
a("portal.arpnetworks.com");
a("www.arpnetworks.com");

R = new RuleSet("AT Internet");
R.rules.push(new Rule("^http://v75\\.xiti\\.com/", "https://v75.xiti.com/"));
a("v75.xiti.com");

R = new RuleSet("ATBank");
R.rules.push(new Rule("^http://(?:www\\.)?atbank\\.nl/", "https://www.atbank.nl/"));
a("www.atbank.nl");
a("atbank.nl");

R = new RuleSet("AWeber");
R.rules.push(new Rule("^http://(?:www\\.)?aweber\\.com/", "https://www.aweber.com/"));
a("aweber.com");
a("www.aweber.com");

R = new RuleSet("Aaai.org");
R.rules.push(new Rule("^http://(?:www\\.)?aaai\\.org/", "https://www.aaai.org/"));
a("aaai.org");
a("www.aaai.org");

R = new RuleSet("Abbo-shop.ch");
R.rules.push(new Rule("^http://(?:www\\.)?abbo-shop\\.ch/", "https://www.abbo-shop.ch/"));
a("abbo-shop.ch");
a("www.abbo-shop.ch");

R = new RuleSet("AbcLinuxu");
R.rules.push(new Rule("^http://(?:www\\.)?abclinuxu\\.cz/", "https://www.abclinuxu.cz/"));
a("www.abclinuxu.cz");
a("abclinuxu.cz");

R = new RuleSet("AbeBooks");
R.rules.push(new Rule("^http://(?:www\\.)?abebooks\\.co\\.uk/", "https://www.abebooks.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?abebooks\\.com/", "https://www.abebooks.com/"));
a("abebooks.co.uk");
a("www.abebooks.co.uk");
a("abebooks.com");
a("www.abebooks.com");

R = new RuleSet("Aberystwyth University");
R.rules.push(new Rule("^http://([bd-v]\\w+|careers|webmail)\\.aber\\.ac\\.uk/", "https://$1.aber.ac.uk/"));
R.rules.push(new Rule("^http://(www\\.)?aber\\.ac\\.uk/(css|en/(development/(2010_)?registration|ibers/isnh8/(cancel|re(mo|trie)ve)|media))/", "https://www.aber.ac.uk/$2/"));
R.rules.push(new Rule("^http://cadair\\.aber\\.ac\\.uk/dspace/ldap-login", "https://cadair.aber.ac.uk/dspace/ldap-login"));
R.rules.push(new Rule("^http://aber-ac-uk\\.campuspack\\.eu/(Domain|static)/", "https://aber-ac-uk.campuspack.eu/$1/"));
a("aber.ac.uk");
a("blackboard.aber.ac.uk");
a("cadair.aber.ac.uk");
a("careers.aber.ac.uk");
a("exchange.aber.ac.uk");
a("share.aber.ac.uk");
a("shibboleth.aber.ac.uk");
a("staffrecord.aber.ac.uk");
a("studentrecord.aber.ac.uk");
a("voyager.aber.ac.uk");
a("webmail.aber.ac.uk");
a("www.aber.ac.uk");
a("aber-ac-uk.campuspack.eu");

R = new RuleSet("Abiliba");
R.rules.push(new Rule("^http://(?:secure\\.|www\\.)?abiliba\\.net/", "https://secure.abiliba.net/"));
a("abiliba.net");
a("*.abiliba.net");

R = new RuleSet("About Ads (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?aboutads\\.info/", "https://www.aboutads.info/$1"));
R.exclusions.push(new Exclusion("^http://(www\\.)?aboutads\\.info/choices/"));
a("aboutads.info");
a("*.aboutads.info");

R = new RuleSet("AboutUs (partial)");
R.rules.push(new Rule("^http://(www\\.)?aboutus\\.org/(favicon\\.ico|Special/)", "https://$1aboutus.org/$2"));
R.rules.push(new Rule("^http://static\\.aboutus\\.org/", "https://s3.amazonaws.com/au-site-static-assets/"));
a("aboutus.org");
a("*.aboutus.org");

R = new RuleSet("Abuse.ch");
R.rules.push(new Rule("^http://www\\.abuse\\.ch/", "https://www.abuse.ch/"));
a("www.abuse.ch");

R = new RuleSet("Academia.edu (partial)");
R.rules.push(new Rule("^http://(assets|images|photos)\\.academia\\.edu/", "https://s3.amazonaws.com/academia.edu.$1/"));
a("*.academia.edu");

R = new RuleSet("Accellion");
R.rules.push(new Rule("^http://(www\\.)?accellion\\.com/", "https://$1accellion.com/"));
a("accellion.com");
a("*.accellion.com");

R = new RuleSet("AccessNow.org");
R.rules.push(new Rule("^http://(?:www\\.)?accessnow\\.org/", "https://www.accessnow.org/"));
a("accessnow.org");
a("www.accessnow.org");

R = new RuleSet("Accessibility.nl");
R.rules.push(new Rule("^http://(?:www\\.)?accessibility\\.nl/", "https://www.accessibility.nl/"));
a("www.accessibility.nl");
a("accessibility.nl");

R = new RuleSet("Accessible Information Management (gunadiframework.com)");
R.rules.push(new Rule("^http://gunadiframework\\.com/", "https://gunadiframework.com/"));
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.gunadiframework\\.com/", "https://$1.gunadiframework.com/"));
a("gunadiframework.com");
a("*.gunadiframework.com");

R = new RuleSet("Acenet (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?ace-host\\.net/", "https://$1ace-host.net/"));
R.rules.push(new Rule("^http://(www\\.)?ace-net\\.net/", "https://$1ace-host.net/"));
R.rules.push(new Rule("^http://(billing|esupport)\\.acenet-inc\\.net/", "https://$1.acenet-inc.net/"));
R.exclusions.push(new Exclusion("http://billing\\.ace-host\\.net/(announcements|index)\\.php$"));
R.exclusions.push(new Exclusion("http://(demos|testimonials)\\.ace-host\\.net/"));
a("ace-host.net");
a("*.ace-host.net");
a("acenet-inc.net");
a("*.acenet-inc.net");
a("*.esupport.acenet-inc.net");

R = new RuleSet("Acro Media (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?acromediainc\\.com/(acronet|careers|co(ntact|ntent-management|nversion-calculator)|drupal-development|news(/|letter/|-articles)|ongoing-(services|marketing)|privacy-policy|process|sites/|strategy-planning|team|uploads/)", "https://www.acromediainc.com/$1"));
a("acromediainc.com");
a("www.acromediainc.com");

R = new RuleSet("Act-On Software (partial)");
R.rules.push(new Rule("^http://(www\\.)?actonsoftware\\.com/", "https://$1actonsoftware.com/"));
a("actonsoftware.com");
a("www.actonsoftware.com");

R = new RuleSet("Act.demandprogress.org");
R.rules.push(new Rule("^http://act\\.demandprogress\\.org/", "https://act.demandprogress.org/"));
a("act.demandprogress.org");

R = new RuleSet("ActBlue (partial)");
R.rules.push(new Rule("^http://(?:(?:s\\.)?secure\\.|www\\.)?actblue\\.com/", "https://secure.actblue.com/"));
R.rules.push(new Rule("^http://public\\.actblue\\.com/", "https://s3.amazonaws.com/public.actblue.com/"));
a("actblue.com");
a("s.secure.actblue.com");
a("*.actblue.com");

R = new RuleSet("Actel.com");
R.rules.push(new Rule("^http://actel\\.com/", "https://www.actel.com/"));
R.rules.push(new Rule("^http://www\\.actel\\.com/", "https://www.actel.com/"));
a("actel.com");
a("www.actel.com");

R = new RuleSet("Ad4Game (partial)");
R.rules.push(new Rule("^http://(ads|traffic)\\.ad4game\\.com/", "https://$1.ad4game.com/"));
a("*.ad4game.com");

R = new RuleSet("AdaCore");
R.rules.push(new Rule("^http://(\\w+\\.)?adacore\\.com/", "https://$1adacore.com/"));
a("adacore.com");
a("*.adacore.com");

R = new RuleSet("AdaFruit");
R.rules.push(new Rule("^http://(?:www\\.)?adafruit\\.com/", "https://www.adafruit.com/"));
a("www.adafruit.com");
a("adafruit.com");

R = new RuleSet("Adblade (partial)");
R.rules.push(new Rule("^http://(www\\.)?adblade\\.com/(css|images|img|registration)/", "https://$1adblade.com/$2/"));
R.rules.push(new Rule("^http://pixel\\.adblade\\.com/", "https://pixel.adblade.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?reachmode\\.com/", "https://www.adblade.com/"));
R.rules.push(new Rule("^http://web\\.reachmode\\.com/", "https://web.reachmode.com/"));
a("adblade.com");
a("*.adblade.com");
a("reachmode.com");
a("*.reachmode.com");

R = new RuleSet("AdblockPlus");
R.rules.push(new Rule("^http://(?:www\\.)?adblockplus\\.org/", "https://adblockplus.org/"));
R.rules.push(new Rule("^http://(easylist|easylist-downloads|hg|reports)\\.adblockplus\\.org/", "https://$1.adblockplus.org/"));
a("adblockplus.org");
a("*.adblockplus.org");

R = new RuleSet("Adbrite");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.adbrite\\.com/", "https://$1.adbrite.com/"));
a("www.adbrite.com");
a("adbrite.com");

R = new RuleSet("Add2Net (partial)");
R.rules.push(new Rule("^http://(www\\.)?lpdedicated\\.com/", "https://$1lpdedicated.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?lplogin\\.com/", "https://account.lunarpages.com/"));
R.rules.push(new Rule("^http://(www\\.)?lunar(mod|page)s\\.com/", "https://$1lunarpages.com/"));
R.rules.push(new Rule("^http://(account|secure|support)\\.lunarpages\\.com/", "https://$1.lunarpages.com/"));
R.rules.push(new Rule("^http://(www\\.)?lunarpages\\.co(m\\.mx|\\.uk)/", "https://$1lunarpages.co$2/"));
R.rules.push(new Rule("^http://(www\\.)?tremendesk\\.com/", "https://$1tremendesk.com/"));
a("lpdedicated.com");
a("www.lpdedicated.com");
a("lplogin.com");
a("www.lplogin.com");
a("lunarmods.com");
a("www.lunarmods.com");
a("lunarpages.com");
a("*.lunarpages.com");
a("lunarpages.com.mx");
a("www.lunarpages.com.mx");
a("lunarpages.co.uk");
a("www.lunarpages.co.uk");
a("tremendesk.com");
a("*.tremendesk.com");

R = new RuleSet("AddBooks.se");
R.rules.push(new Rule("^http://www\\.addbooks\\.se/", "https://www.addbooks.se/"));
R.rules.push(new Rule("^http://addbooks\\.se/", "https://addbooks.se/"));
a("www.addbooks.se");
a("addbooks.se");

R = new RuleSet("AddThis");
R.rules.push(new Rule("^http://(?:www\\.)?addthis\\.com/bookmark\\.php", "https://www.addthis.com/bookmark.php"));
R.rules.push(new Rule("^http://(api|cache|ds|s[3579])\\.addthis\\.com/", "https://$1.addthis.com/"));
R.rules.push(new Rule("^http://cache\\.addthiscdn\\.com/", "https://cache.addthiscdn.com/"));
a("addthis.com");
a("*.addthis.com");
a("cache.addthiscdn.com");

R = new RuleSet("AddToAny");
R.rules.push(new Rule("^http://static\\.addtoany\\.com/", "https://static.addtoany.com/"));
a("static.addtoany.com");

R = new RuleSet("Addictech");
R.rules.push(new Rule("^http://(www\\.)?addictech\\.com/", "https://www.addictech.com/"));
R.rules.push(new Rule("^http://assets\\.musicwindow\\.com/public/", "https://www.addictech.com/shared/assetlink.php?file=public/"));
a("addictech.com");
a("www.addictech.com");
a("assets.musicwindow.com");

R = new RuleSet("Adlibris/Capris");
R.rules.push(new Rule("^http://(?:www\\.)?(adlibris\\.com|capris\\.no)/", "https://www.$1/"));
a("www.adlibris.com");
a("adlibris.com");
a("www.capris.no");
a("capris.no");

R = new RuleSet("Admeta Aktiebolag (partial)");
R.rules.push(new Rule("^http://(www\\.)?atemda\\.com/", "https://$1atemda.com/"));
a("atemda.com");
a("*.atemda.com");

R = new RuleSet("Adobe");
R.rules.push(new Rule("^http://adobe\\.com/", "https://www.adobe.com/"));
R.rules.push(new Rule("^http://(blogs|cookbooks|edexchange|cem\\.events|get|kuler|www)\\.adobe\\.com/", "https://$1.adobe.com/"));
R.rules.push(new Rule("^http://wwwimages\\.adobe\\.com/www\\.adobe\\.com/", "https://www.adobe.com/"));
R.rules.push(new Rule("^http://bank\\.demdex\\.com/", "https://bank.demdex.com/"));
R.rules.push(new Rule("^http://cdn\\.demdex\\.net/", "https://a248.e.akamai.net/demdex.download.akamai.com/"));
R.rules.push(new Rule("^http://login\\.hitbox\\.com/", "https://login.hitbox.com/"));
R.rules.push(new Rule("^http://fpdownload\\.macromedia\\.com/", "https://fpdownload.macromedia.com/"));
R.rules.push(new Rule("^http://omniture\\.com/", "https://www.omniture.com/"));
R.rules.push(new Rule("^http://(assets|my|publish|sc-css-1|searchandpromote|(admin\\.)?testandtarget|style|www)\\.omniture\\.com/", "https://$1.omniture.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?omniture-static\\.com/", "https://www.omniture-static.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.tt\\.omtrdc\\.net/", "https://$1.tt.omtrdc.net/"));
R.rules.push(new Rule("^http://(?:www1?\\.)?scene7\\.com/", "https://www1.scene7.com/"));
R.rules.push(new Rule("^http://use\\.typekit\\.com/", "https://use.typekit.com/"));
R.rules.push(new Rule("^http://worldsecuresystems\\.com/", "https://worldsecuresystems.com/"));
a("*.adobe.com");
a("cem.events.adobe.com");
a("adobe.com");
a("*.demdex.com");
a("login.hitbox.com");
a("omniture.com");
a("*.omniture.com");
a("omniture-static.com");
a("www.omniture-static.com");
a("*.tt.omtrdc.net");
a("scene7.com");
a("www.scene7.com");
a("www1.scene7.com");
a("worldsecuresystems.com");
a("fpdownload.macromedia.com");
a("use.typekit.com");

R = new RuleSet("Adoyacademy.se");
R.rules.push(new Rule("^http://www\\.adoyacademy\\.se/", "https://adoyacademy.se/"));
R.rules.push(new Rule("^http://adoyacademy\\.se/", "https://adoyacademy.se/"));
a("www.adoyacademy.se");
a("adoyacademy.se");

R = new RuleSet("Adtech.de");
R.rules.push(new Rule("^http://adserver\\.adtech\\.de/", "https://adserver.adtech.de/"));
a("*.adtech.de");

R = new RuleSet("Advanced Micro Devices (partial)");
R.rules.push(new Rule("^http://(?:support|www)\\.amd\\.com/(?:PublishingImages/Restricted/Graphic/HighResolutionJPEG/(www_background\\.jpg)|Style%20Library/Images/AMD/((amd_logo|main(_content_bottom|content_top)|mast_head)\\.png|spacer\\.gif))", "https://sso.amd.com/Registration/Images/$1$2"));
R.rules.push(new Rule("^http://metrics\\.amd\\.com/", "https://amdvglobal.122.2o7.net/"));
R.rules.push(new Rule("^http://s(ecure|sl-developer|so)\\.amd\\.com/", "https://s$1.amd.com/"));
R.rules.push(new Rule("^http://support\\.amd\\.com/Style%20Library/Images/AMD/AMD_logo\\.png", "https://sso.amd.com/Registration/Images/amd_logo.png"));
a("*.amd.com");

R = new RuleSet("Aea.se");
R.rules.push(new Rule("^http://www\\.aea\\.se/", "https://www.aea.se/"));
R.rules.push(new Rule("^http://aea\\.se/", "https://aea.se/"));
a("www.aea.se");
a("aea.se");

R = new RuleSet("Aeriagames");
R.rules.push(new Rule("^http://(?:www\\.)?aeriagames\\.com/", "https://www.aeriagames.com/"));
a("www.aeriagames.com");
a("aeriagames.com");

R = new RuleSet("Afford.com");
R.rules.push(new Rule("^http://borrowsmart\\.afford\\.com/", "https://borrowsmart.afford.com/"));
R.rules.push(new Rule("^http://(www\\.)?afford\\.com/", "https://www.afford.com/"));
a("afford.com");
a("borrowsmart.afford.com");
a("www.afford.com");

R = new RuleSet("FreeDNS.Afraid.org");
R.rules.push(new Rule("^http://freedns\\.afraid\\.org/", "https://freedns.afraid.org/"));
a("freedns.afraid.org");

R = new RuleSet("Aftenposten");
R.rules.push(new Rule("^http://(?:www\\.)?aftenposten\\.no/", "https://www.aftenposten.no/"));
a("www.aftenposten.no");
a("aftenposten.no");

R = new RuleSet("Agnitum");
R.rules.push(new Rule("^http://www\\.agnitum\\.com/", "https://www.agnitum.com/"));
R.rules.push(new Rule("^http://agnitum\\.com/", "https://www.agnitum.com/"));
a("agnitum.com");
a("www.agnitum.com");

R = new RuleSet("Ahnlab");
R.rules.push(new Rule("^http://global\\.ahnlab\\.com/", "https://global.ahnlab.com/"));
R.rules.push(new Rule("^http://image\\.ahnlab\\.com/", "https://image.ahnlab.com/"));
a("image.ahnlab.com");
a("global.ahnlab.com");

R = new RuleSet("Air Canada Pilot's Association (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?acpa\\.ca/(client_asset/|multimedia/)", "https://secure.acpa.ca/$1/"));
R.rules.push(new Rule("^http://secure\\.acpa\\.ca/", "https://secure.acpa.ca/"));
a("acpa.ca");
a("secure.acpa.ca");
a("www.acpa.ca");

R = new RuleSet("Air Asia");
R.rules.push(new Rule("^http://(?:www\\.)?airasia\\.com/", "https://www.airasia.com/"));
R.rules.push(new Rule("^http://(booking|booking2|goholiday|mobile|origin-www|redtix-tickets)\\.airasia\\.com/", "https://$1.airasia.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?airasiamegastore\\.com/", "https://www.airasiamegastore.com/"));
a("airasia.com");
a("*.airasia.com");
a("airasiamegastore.com");
a("www.airasiamegastore.com");

R = new RuleSet("Air VPN");
R.rules.push(new Rule("^http://(www\\.)?airvpn\\.org/", "https://$1airvpn.org/"));
a("airvpn.org");
a("www.airvpn.org");

R = new RuleSet("AirshipVentures");
R.rules.push(new Rule("^http://(?:www\\.)?airshipventures\\.com/", "https://www.airshipventures.com/"));
a("www.airshipventures.com");
a("airshipventures.com");

R = new RuleSet("Airtricity");
R.rules.push(new Rule("^http://airtricity\\.com/", "https://www.airtricity.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.airtricity\\.com/", "https://$1.airtricity.com/"));
a("www.airtricity.com");
a("airtricity.com");
a("*.airtricity.com");

R = new RuleSet("AkademikerFörsäkring.se");
R.rules.push(new Rule("^http://(?:www\\.)?akademikerforsakring\\.se/", "https://www.akademikerforsakring.se/"));
R.rules.push(new Rule("^http://(?:www\\.)?akademikerförsäkring\\.se/", "https://www.akademikerforsakring.se/"));
a("akademikerforsakring.se");
a("www.akademikerforsakring.se");
a("akademikerförsäkring.se");
a("www.akademikerförsäkring.se");

R = new RuleSet("Akamai");
R.rules.push(new Rule("^http://ak1s\\.abmr\\.net/", "https://ak1s.abmr.net/"));
R.rules.push(new Rule("^http://a248\\.e\\.akamai\\.net/", "https://a248.e.akamai.net/"));
R.rules.push(new Rule("^http://([^@:/\\.]+)\\.akamaihd\\.net/", "https://$1.akamaihd.net/"));
R.rules.push(new Rule("^http://(?:[\\w\\-]+)\\.speedera\\.net/", "https://ssl.speedera.net/"));
a("ak1s.abmr.net");
a("a248.e.akamai.net");
a("*.akamaihd.net");
a("*.speedera.net");

R = new RuleSet("Akismet");
R.rules.push(new Rule("^http://(?:www\\.)?akismet\\.com/", "https://akismet.com/"));
a("akismet.com");
a("www.akismet.com");

R = new RuleSet("Alaska Airlines");
R.rules.push(new Rule("^http://alaskaair\\.com/", "https://www.alaskaair.com/"));
R.rules.push(new Rule("^http://(careers|easybiz|myeagle|webselfservice|www)\\.alaskaair\\.com/", "https://$1.alaskaair.com/"));
a("alaskaair.com");
a("*.alaskaair.com");

R = new RuleSet("Alastair’s Place");
R.rules.push(new Rule("^http://(www\\.)?alastairs-place\\.net/", "https://$1alastairs-place.net/"));
a("alastairs-place.net");
a("www.alastairs-place.net");

R = new RuleSet("Alcuda (partial)");
R.rules.push(new Rule("^http://whitelabeldating\\.(?:alcuda|upforitnetworks)\\.com/", "https://whitelabeldating.upforitnetworks.com/"));
R.rules.push(new Rule("^http://(?:cdn\\.)?wl\\.easydategroup\\.com/static/", "https://www.upforit.com/static/"));
R.rules.push(new Rule("^http://(?:cdn\\.(imgstat|picstat2|statimgs2)|upforit)\\.com/", "https://www.upforit.com/"));
R.rules.push(new Rule("^http://shagaholic\\.com/", "https://www.shagaholic.com/"));
R.rules.push(new Rule("^http://www\\.(shagaholic|upforit)\\.com/(login\\.html|static/)", "https://www.$1.com/$2"));
R.rules.push(new Rule("^http://affiliates\\.upforitnetworks\\.com/", "https://affiliates.upforitnetworks.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?xhamster\\.biz/static/", "https://www.upforit.com/static/"));
a("whitelabeldating.alcuda.com");
a("wl.easydategroup.com");
a("cdn.wl.easydategroup.com");
a("cdn.imgstat.com");
a("cdn.picstat2.com");
a("shagaholic.com");
a("www.shagaholic.com");
a("cdn.statimgs2.com");
a("upforit.com");
a("www.upforit.com");
a("*.upforitnetworks.com");
a("xhamster.biz");
a("www.xhamster.biz");

R = new RuleSet("Alex.se");
R.rules.push(new Rule("^http://www\\.alex\\.se/", "https://www.alex.se/"));
R.rules.push(new Rule("^http://alex\\.se/", "https://alex.se/"));
a("www.alex.se");
a("alex.se");

R = new RuleSet("Alexa (partial)");
R.rules.push(new Rule("^http://(www\\.)?alexa\\.com/images/", "https://$1alexa.com/images/"));
R.rules.push(new Rule("^http://pcache\\.alexa\\.com/", "https://d1d024ntqri789.cloudfront.net/"));
a("alexa.com");
a("*.alexa.com");

R = new RuleSet("AliceDSL");
R.rules.push(new Rule("^http://(?:www\\.)?alice\\.de/", "https://www.alice-dsl.de/"));
R.rules.push(new Rule("^http://alice\\.de/", "https://www.alice-dsl.de/"));
R.rules.push(new Rule("^http://alice-dsl\\.de/", "https://www.alice-dsl.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?alice-dsl\\.de/", "https://www.alice-dsl.de/"));
a("alice.de");
a("*.alice.de");
a("alice-dsl.de");
a("*.alice-dsl.de");
a("www.alice-dsl.de");

R = new RuleSet("All-inkl.com");
R.rules.push(new Rule("^http://all-inkl\\.com/", "https://all-inkl.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.all-inkl\\.com/", "https://$1.all-inkl.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?all-inkl\\.[^/:@][^/:@]/", "https://all-inkl.com/"));
a("*.all-inkl.com");
a("all-inkl.*");
a("www.all-inkl.*");

R = new RuleSet("AllThingsD");
R.rules.push(new Rule("^http://(?:www\\.)?allthingsd\\.com/", "https://allthingsd.com/"));
a("allthingsd.com");
a("www.allthingsd.com");

R = new RuleSet("AlliedModders forum");
R.rules.push(new Rule("^http://forums\\.alliedmods\\.net/", "https://forums.alliedmods.net/"));
a("forums.alliedmods.net");

R = new RuleSet("Allingsas.se");
R.rules.push(new Rule("^http://www\\.allingsas\\.se/", "https://www.allingsas.se/"));
R.rules.push(new Rule("^http://allingsas\\.se/", "https://allingsas.se/"));
a("www.allingsas.se");
a("allingsas.se");

R = new RuleSet("Alternate");
R.rules.push(new Rule("^http://([^/:@]*)\\.alternate\\.be/", "https://$1.alternate.be/"));
R.rules.push(new Rule("^http://alternate\\.be/", "https://alternate.be/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.alternate\\.nl/", "https://$1.alternate.nl/"));
R.rules.push(new Rule("^http://alternate\\.nl/", "https://alternate.nl/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.alternate-b2b\\.nl/", "https://$1.alternate-b2b.nl/"));
R.rules.push(new Rule("^http://alternate-b2b\\.nl/", "https://alternate-b2b.nl/"));
a("*.alternate.be");
a("alternate.be");
a("*.alternate.nl");
a("alternate.nl");
a("*.alternate-b2b.nl");
a("alternate-b2b.nl");

R = new RuleSet("Alticore (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?amway\\.com/", "https://www.amway.com/"));
R.rules.push(new Rule("^http://(www\\.)?bww\\.com/(css/|images/|Common/CharitableGiving\\.aspx)", "https://$1bww.com/$2"));
R.rules.push(new Rule("^http://(www\\.)?lauramercier\\.com/(store/(account|cart|template)/|subscription/)", "https://$1lauramercier.com/$2"));
R.exclusions.push(new Exclusion("^http://www\\.amway\\.com/Shop/Product/"));
a("amway.com");
a("www.amway.com");
a("bww.com");
a("www.bww.com");
a("lauramercier.com");
a("www.lauramercier.com");

R = new RuleSet("AltonTowers");
R.rules.push(new Rule("^http://(?:www\\.)?altontowers\\.com/", "https://www.altontowers.com/"));
a("altontowers.com");
a("www.altontowers.com");

R = new RuleSet("Amahi.org");
R.rules.push(new Rule("^http://www\\.amahi\\.org/", "https://www.amahi.org/"));
R.rules.push(new Rule("^http://wiki\\.amahi\\.org/", "https://wiki.amahi.org/"));
R.rules.push(new Rule("^http://amahi\\.org/", "https://amahi.org/"));
a("www.amahi.org");
a("wiki.amahi.org");
a("amahi.org");

R = new RuleSet("Amazon Web Services");
R.rules.push(new Rule("^http://(signin\\.aws|aws(-portal)?|payments|sis|ws)\\.amazon\\.com/", "https://$1.amazon.com/"));
R.rules.push(new Rule("^http://s3\\.amazonaws\\.com/", "https://s3.amazonaws.com/"));
R.rules.push(new Rule("^http://([^@:\\.]+)\\.s3\\.amazonaws\\.com/", "https://$1.s3.amazonaws.com/"));
R.rules.push(new Rule("^http://([^@:\\.]+)\\.([^@:/]+)\\.s3\\.amazonaws\\.com/", "https://s3.amazonaws.com/$1.$2/"));
R.rules.push(new Rule("^http://(?:www\\.)?amazonwebservices\\.com/", "https://aws.amazon.com/"));
R.rules.push(new Rule("^http://developer\\.amazonwebservices\\.com/", "https://developer.amazonwebservices.com/"));
R.rules.push(new Rule("^http://media\\.amazonwebservices\\.com/", "https://s3.amazonaws.com/awsmedia/"));
R.rules.push(new Rule("^http://(?:(?:\\w-)?ecx\\.images-|images\\.)amazon\\.com/", "https://images-na.ssl-images-amazon.com/"));
R.exclusions.push(new Exclusion("^http://static\\.via\\.me\\.s3\\.amazonaws\\.com/"));
a("aws.amazon.com");
a("signin.aws.amazon.com");
a("aws-portal.amazon.com");
a("images.amazon.com");
a("payments.amazon.com");
a("sis.amazon.com");
a("ws.amazon.com");
a("s3.amazonaws.com");
a("*.s3.amazonaws.com");
a("cdn.*.s3.amazonaws.com");
a("*.images-amazon.com");
a("amazonwebservices.com");
a("*.amazonwebservices.com");

R = new RuleSet("Ambx.com");
R.rules.push(new Rule("^http://(?:www\\.)?ambx\\.com/", "https://www.ambx.com/"));
a("ambx.com");
a("www.ambx.com");

R = new RuleSet("American Chemical Society (partial)");
R.rules.push(new Rule("^http://(assets|portal)\\.acs\\.org/", "https://$1.acs.org/"));
R.rules.push(new Rule("^http://pubs\\.acs\\.org/(action/showLogin|sda/|templates/)", "https://pubs.acs.org/$1"));
R.rules.push(new Rule("^http://cas\\.org/", "https://www.cas.org/"));
R.rules.push(new Rule("^http://(my|scifinder|stneasy(-japan)?|www)\\.cas\\.org/", "https://$1.cas.org/"));
R.exclusions.push(new Exclusion("^http://cen\\.acs\\.org/"));
R.exclusions.push(new Exclusion("^http://cas\\.org/products/scifindr/$"));
R.exclusions.push(new Exclusion("^http://sitesearch\\.cas\\.org/"));
a("*.acs.org");
a("cas.org");
a("*.cas.org");

R = new RuleSet("American Epilepsy Society (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?aesnet\\.org/erc/", "https://www.aesnet.org/erc/"));
a("aesnet.org");
a("www.aesnet.org");

R = new RuleSet("American Foundation for Suicide Prevention");
R.rules.push(new Rule("^((http://(?:www\\.)?)|https://)afsp\\.org/", "https://www.afsp.org/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?afsp\\.org/indiana$"));
a("afsp.org");
a("www.afsp.org");

R = new RuleSet("American Physical Society (partial)");
R.rules.push(new Rule("^http://(\\w+)\\.aps\\.org/(files/|images/|misc/|sites/[\\w\\-/]+/(themes/)|style(sheets)?/)", "https://$1.aps.org/$2"));
R.rules.push(new Rule("^http://publish\\.aps\\.org/(login|signup)", "https://publish.aps.org/$1"));
R.rules.push(new Rule("^http://publish\\.aps\\.org/favicon\\.ico", "https://www.aps.org/favicon.ico/"));
R.rules.push(new Rule("^https://(authors|referees|tesseract-assets)\\.aps\\.org/", "https://$1.aps.org/"));
R.rules.push(new Rule("^https://(?:www\\.)?aps\\.org/(commonspot/|elementadmin/|[\\w\\-_/]+images/|style/|templates/|)", "https://www.aps.org/$1"));
R.exclusions.push(new Exclusion("^http://(counter|feeds|physics|pr[bl]|prola)\\."));
a("aps.org");
a("*.aps.org");

R = new RuleSet("American Public Media");
R.rules.push(new Rule("^http://(?:(origin-)?www\\.)?marketplace\\.org/", "https://origin-www.marketplace.org/"));
a("marketplace.org");
a("www.marketplace.org");
a("origin-www.marketplace.org");

R = new RuleSet("AmericanExpress");
R.rules.push(new Rule("^http://(?:www\\.)?americanexpress\\.com/", "https://www.americanexpress.com/"));
R.rules.push(new Rule("^http://home\\.americanexpress\\.com/", "https://home.americanexpress.com/"));
a("www.americanexpress.com");
a("americanexpress.com");
a("home.americanexpress.com");

R = new RuleSet("Americana Exchange");
R.rules.push(new Rule("^http://(?:www\\.)?americanaexchange\\.com/", "https://www.americanaexchange.com/"));
a("americanaexchange.com");
a("www.americanaexchange.com");

R = new RuleSet("Amnesty-International");
R.rules.push(new Rule("^http://(?:www\\.)?amnesty\\.org/", "https://www.amnesty.org/"));
a("www.amnesty.org");
a("amnesty.org");

R = new RuleSet("An Post");
R.rules.push(new Rule("^http://(?:www\\.)?anpost\\.ie/", "https://www.anpost.ie/"));
a("www.anpost.ie");
a("anpost.ie");

R = new RuleSet("Ancestry.com (partial)");
R.rules.push(new Rule("^http://dna\\.ancestry\\.com/", "https://dna.ancestry.com/"));
R.rules.push(new Rule("^http://(?:secure\\.)?store\\.ancestry\\.com/", "https://secure.store.ancestry.com/"));
R.rules.push(new Rule("^http://(?:secure\\.|www\\.)?mycanvas\\.com/", "https://secure.mycanvas.com/"));
a("*.ancestry.com");
a("secure.store.ancestry.com");
a("mycanvas.com");
a("*.mycanvas.com");

R = new RuleSet("AnchorFree (partial)");
R.rules.push(new Rule("^http://rpt\\.anchorfree\\.net/", "https://rpt.anchorfree.net/"));
R.rules.push(new Rule("^http://(www\\.)?h(otspotshield|sselite)\\.com/", "https://$1h$2.com/"));
a("rpt.anchorfree.net");
a("hotspotshield.com");
a("www.hotspotshield.com");
a("hsselite.com");
a("www.hsselite.com");

R = new RuleSet("Android");
R.rules.push(new Rule("^http://(developer|market)\\.android\\.com/", "https://$1.android.com/"));
a("market.android.com");
a("developer.android.com");

R = new RuleSet("Androidpolice");
R.rules.push(new Rule("^http://(www\\.)?androidpolice\\.com/", "https://www.androidpolice.com/"));
a("www.androidpolice.com");
a("androidpolice.com");

R = new RuleSet("Animenfo.com");
R.rules.push(new Rule("^http://(?:www\\.)?animenfo\\.com/", "https://www.animenfo.com/"));
a("animenfo.com");
a("www.animenfo.com");

R = new RuleSet("AnnualCreditReport.com");
R.rules.push(new Rule("^https?://annualcreditreport\\.com/", "https://www.annualcreditreport.com/"));
R.rules.push(new Rule("^http://([A-Za-z0-9\\-]+)\\.annualcreditreport\\.com/", "https://$1.annualcreditreport.com/"));
a("annualcreditreport.com");
a("*.annualcreditreport.com");

R = new RuleSet("Ansa.it");
R.rules.push(new Rule("^http://(?:www\\.)?ansa\\.it/", "https://www.ansa.it/"));
a("www.ansa.it");
a("ansa.it");

R = new RuleSet("AntiSpam e.V.");
R.rules.push(new Rule("^http://(?:www\\.)?antispam\\.de/", "https://www.antispam.de/"));
a("antispam.de");
a("www.antispam.de");

R = new RuleSet("Anybeat");
R.rules.push(new Rule("^http://(www\\.)?anybeat\\.com/", "https://www.anybeat.com/"));
a("www.anybeat.com");
a("anybeat.com");

R = new RuleSet("Apache");
R.rules.push(new Rule("^http://(?:www\\.)?apache\\.org/", "https://www.apache.org/"));
R.rules.push(new Rule("^http://([^/:@]+)?\\.apache\\.org/", "https://$1.apache.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?apache-ssl\\.org/", "https://www.apache-ssl.org/"));
R.exclusions.push(new Exclusion("^http://ooo-forums\\.apache\\.org/"));
a("apache.org");
a("*.apache.org");
a("apache-ssl.org");
a("www.apache-ssl.org");

R = new RuleSet("Apoteket.se");
R.rules.push(new Rule("^http://apoteket\\.se/", "https://www.apoteket.se/"));
R.rules.push(new Rule("^http://www\\.apoteket\\.se/", "https://www.apoteket.se/"));
a("apoteket.se");
a("www.apoteket.se");

R = new RuleSet("AppNexus");
R.rules.push(new Rule("^http://(\\w+\\.)?adnxs\\.com/", "https://$1adnxs.com/"));
a("adnxs.com");
a("*.adnxs.com");

R = new RuleSet("Appache (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?5apps\\.com/", "https://5apps.com/"));
R.rules.push(new Rule("^http://develop\\.5apps\\.com/", "https://develop.5apps.com/"));
a("5apps.com");
a("develop.5apps.com");
a("www.5apps.com");

R = new RuleSet("Appdillo (partial)");
R.rules.push(new Rule("^http://cdn\\.coderwall\\.com/", "https://coderwall-assets-0.s3.amazonaws.com/"));
a("cdn.coderwall.com");

R = new RuleSet("Apple.com (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?apple\\.com/", "https://www.apple.com/"));
R.rules.push(new Rule("^http://(appleid|application|buyiphone|certifications|connect|daw|developer|devforums|discussions|id|iforgot|itunesconnect|jobs|portal|register|remoteadvisor|selfsolve|support)\\.apple\\.com/", "https://$1.apple.com/"));
R.rules.push(new Rule("^http://images\\.apple\\.com/", "https://ssl.apple.com/"));
R.rules.push(new Rule("^http://km\\.support\\.apple\\.com/", "https://support.apple.com/"));
a("apple.com");
a("appleid.apple.com");
a("application.apple.com");
a("buyiphone.apple.com");
a("certifications.apple.com");
a("connect.apple.com");
a("daw.apple.com");
a("developer.apple.com");
a("devforums.apple.com");
a("discussions.apple.com");
a("id.apple.com");
a("iforgot.apple.com");
a("images.apple.com");
a("itunesconnect.apple.com");
a("jobs.apple.com");
a("portal.apple.com");
a("register.apple.com");
a("remoteadvisor.apple.com");
a("selfsolve.apple.com");
a("support.apple.com");
a("km.support.apple.com");
a("www.apple.com");

R = new RuleSet("Applebee's");
R.rules.push(new Rule("^http://applebees\\.com/", "https://applebees.com/"));
R.rules.push(new Rule("^http://(my|www)\\.applebees\\.com/", "https://$1.applebees.com/"));
a("applebees.com");
a("*.applebees.com");

R = new RuleSet("Applicom (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?apollohq\\.com/img/favicon(\\d\\d)\\.png$", "https://launchpad.apollohq.com/js/__dojo__1332519149/res/img/common/icon$1.png"));
R.rules.push(new Rule("^http://launchpad\\.apollohq\\.com/", "https://launchpad.apollohq.com/"));
a("apollohq.com");
a("*.apollohq.com");

R = new RuleSet("April.org");
R.rules.push(new Rule("^http://([^/:@]*)\\.april\\.org/", "https://$1.april.org/"));
a("*.april.org");

R = new RuleSet("Aquent (partial)");
R.rules.push(new Rule("^http://(www\\.)?aquent\\.com/", "https://$1aquent.com/"));
R.rules.push(new Rule("^http://(www\\.)?aquent\\.us/(common|global)/", "https://$1aquent.com/$2/"));
a("aquent.com");
a("*.aquent.com");
a("aquent.us");
a("www.aquent.us");

R = new RuleSet("Aquiss (partial)");
R.rules.push(new Rule("^http://secure\\.aquiss\\.net/", "https://secure.aquiss.net/"));
a("secure.aquiss.net");

R = new RuleSet("Arbeitsagentur.de");
R.rules.push(new Rule("^http://(?:www\\.)?arbeitsagentur\\.de/", "https://www.arbeitsagentur.de/"));
R.rules.push(new Rule("^http://jobboerse\\.arbeitsagentur\\.de/", "https://jobboerse.arbeitsagentur.de/"));
a("arbeitsagentur.de");
a("www.arbeitsagentur.de");
a("jobboerse.arbeitsagentur.de");

R = new RuleSet("Arch Linux");
R.rules.push(new Rule("^http://archlinux\\.org/", "https://www.archlinux.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.archlinux\\.org/", "https://$1.archlinux.org/"));
a("archlinux.org");
a("*.archlinux.org");

R = new RuleSet("ArchiveOfOurOwn");
R.rules.push(new Rule("^http://(www\\.)?archiveofourown\\.org/", "https://archiveofourown.org/"));
a("archiveofourown.org");
a("www.archiveofourown.org");

R = new RuleSet("Archos.com");
R.rules.push(new Rule("^http://(?:www\\.)?archos\\.com/", "https://www.archos.com/"));
a("archos.com");
a("www.archos.com");

R = new RuleSet("Argos");
R.rules.push(new Rule("^http://(?:www\\.)?argos\\.co\\.uk/", "https://www.argos.co.uk/"));
a("www.argos.co.uk");
a("argos.co.uk");

R = new RuleSet("Argyle Social (partial)");
R.rules.push(new Rule("^http://goals\\.ar\\.gy/", "https://goals.ar.gy/"));
a("goals.ar.gy");

R = new RuleSet("Ariejan.net (partial)");
R.rules.push(new Rule("^http://www\\.ariejan\\.net/", "https://ariejan.net/"));
R.rules.push(new Rule("^http://ariejan\\.net/assets/", "https://ariejan.net/assets/"));
a("ariejan.net");
a("www.ariejan.net");

R = new RuleSet("Arlanda.se");
R.rules.push(new Rule("^http://arlanda\\.se/", "https://www.arlanda.se/"));
R.rules.push(new Rule("^http://www\\.arlanda\\.se/", "https://www.arlanda.se/"));
a("arlanda.se");
a("www.arlanda.se");

R = new RuleSet("Art Practical");
R.rules.push(new Rule("^http://(www\\.)?artpractical\\.com/", "https://artpractical.com/"));
a("artpractical.com");
a("www.artpractical.com");

R = new RuleSet("Aspect Security");
R.rules.push(new Rule("^http://(www\\.)?aspectsecurity\\.com/", "https://$1aspectsecurity.com/"));
a("aspectsecurity.com");
a("www.aspectsecurity.com");

R = new RuleSet("Assembla (partial)");
R.rules.push(new Rule("^http://((assets\\d|nooku|scala-ide-portfolio|svn2|trac2?|www)\\.)?assembla\\.com/", "https://$1assembla.com/"));
R.exclusions.push(new Exclusion("^http://www\\.assembla\\.com/(community$|jobs/|search/|spaces/|wiki/)"));
a("assembla.com");
a("*.assembla.com");

R = new RuleSet("associatedcontent.com");
R.rules.push(new Rule("^http://associatedcontent\\.com/", "https://www.associatedcontent.com/"));
R.rules.push(new Rule("^http://www\\.associatedcontent\\.com/", "https://www.associatedcontent.com/"));
a("associatedcontent.com");

R = new RuleSet("Association for Progressive Communications");
R.rules.push(new Rule("^http://(www\\.)?(gn\\.)?apc\\.org/", "https://www.$2apc.org/"));
a("apc.org");
a("www.apc.org");
a("gn.apc.org");
a("www.gn.apc.org");

R = new RuleSet("Asterisk (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?asterisk\\.org/", "https://www.asterisk.org/"));
R.rules.push(new Rule("^http://(forge|wiki)\\.asterisk\\.org/", "https://$1.asterisk.org/"));
R.rules.push(new Rule("^http://(www\\.)?asteriskexchange\\.com/(images|stylesheets|system)/", "https://www.asteriskexchange.com/$2/"));
R.rules.push(new Rule("^http://digium\\.com/", "https://www.digium.com/"));
R.rules.push(new Rule("^http://(login|store|www)\\.digium\\.com/", "https://$1.digium.com/"));
a("asterisk.org");
a("forge.asterisk.org");
a("wiki.asterisk.org");
a("www.asterisk.org");
a("asteriskexchange.com");
a("www.asteriskexchange.com");
a("digium.com");
a("login.digium.com");
a("store.digium.com");
a("www.digium.com");

R = new RuleSet("Asymmetric Publications (partial)");
R.rules.push(new Rule("^http://kingdomofloathing\\.com/", "https://www.kingdomofloathing.com/"));
R.rules.push(new Rule("^http://(images|radio|shows|www)?\\.kingdomofloathing\\.com/", "https://$1.kingdomofloathing.com/"));
a("kingdomofloathing.com");
a("*.kingdomofloathing.com");

R = new RuleSet("AtariAge");
R.rules.push(new Rule("^http://(www\\.)?atariage\\.com/", "https://$1atariage.com/"));
a("atariage.com");
a("*.atariage.com");

R = new RuleSet("atdmt.com");
R.rules.push(new Rule("^http://(clk|switch|view)\\.atdmt\\.com/", "https://$1.atdmt.com/"));
R.rules.push(new Rule("^http://img\\.atdmt\\.com/", "https://a248.e.akamai.net/img.atdmt.com/"));
R.exclusions.push(new Exclusion("^http://view\\.atdmt\\.com/action/windows_downloads_Upgrade"));
a("*.atdmt.com");

R = new RuleSet("Atheists.org");
R.rules.push(new Rule("^http://(?:www\\.)?atheists\\.org/", "https://atheists.org/"));
a("atheists.org");
a("www.atheists.org");

R = new RuleSet("Atlantic Media (partial)");
R.rules.push(new Rule("^http://(?:cdn\\.|www\\.)?govexec\\.com/", "https://www.govexec.com/"));
R.rules.push(new Rule("^http://secure\\.nationaljournal\\.com/", "https://secure.nationaljournal.com/"));
R.rules.push(new Rule("^http://ssl\\.theatlantic\\.com/", "https://ssl.theatlantic.com/"));
a("govexec.com");
a("*.govexec.com");
a("secure.nationaljournal.com");
a("ssl.theatlantic.com");

R = new RuleSet("Atlantic Metro Communications (partial)");
R.rules.push(new Rule("^http://(my\\.|www\\.)?atlanticmetro\\.net/", "https://$1my.atlanticmetro.net/"));
R.exclusions.push(new Exclusion("^http://blog\\."));
a("atlanticmetro.net");
a("*.atlanticmetro.net");

R = new RuleSet("Atlassian");
R.rules.push(new Rule("^http://(?:www\\.)?atlassian\\.com/", "https://www.atlassian.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.atlassian\\.com/", "https://$1.atlassian.com/"));
R.rules.push(new Rule("^http://atlassian\\.wpengine\\.netdna-cdn\\.com/", "https://blogs.atlassian.com/"));
R.rules.push(new Rule("^http://wac\\.29c4\\.edgecastcdn\\.net/8029C4/wac-small//wac/", "https://summit.atlassian.com/"));
a("atlassian.com");
a("*.atlassian.com");
a("*.extranet.atlassian.com");
a("atlassian.wpengine.netdna-cdn.com");

R = new RuleSet("Atomic Cowlick");
R.rules.push(new Rule("^http://(www\\.)?atomiccowlick\\.com/", "https://$1atomiccowlick.com/"));
a("atomiccowlick.com");
a("www.atomiccowlick.com");

R = new RuleSet("Atomicorp");
R.rules.push(new Rule("^http://(www\\.)?atomicorp\\.com/", "https://www.atomicorp.com/"));
a("www.atomicorp.com");
a("atomicorp.com");

R = new RuleSet("The Attachment Group (partial)");
R.rules.push(new Rule("^http://(www\\.)?netiq\\.com/", "https://www.netiq.com/"));
R.rules.push(new Rule("^http://(login|shop)\\.novell\\.com/", "https://$1.novell.com/"));
R.rules.push(new Rule("^http://(build|connect|count(er|down)|doc|features|shop|static)\\.opensuse\\.org/", "https://$1.opensuse.org/"));
a("netiq.com");
a("www.netiq.com");
a("login.novell.com");
a("shop.novell.com");
a("build.opensuse.org");
a("connect.opensuse.org");
a("countdown.opensuse.org");
a("counter.opensuse.org");
a("doc.opensuse.org");
a("features.opensuse.org");
a("shop.opensuse.org");
a("static.opensuse.org");

R = new RuleSet("Attracta");
R.rules.push(new Rule("^http://(\\w+\\.)?attracta\\.com/", "https://$1attracta.com/"));
a("attracta.com");
a("*.attracta.com");

R = new RuleSet("Atypon");
R.rules.push(new Rule("^http://(www\\.)?atypon\\.com/", "https://$1atypon.com/"));
a("atypon.com");
a("*.atypon.com");

R = new RuleSet("Audible.de");
R.rules.push(new Rule("^http://(?:www\\.)?audible\\.de/", "https://www.audible.de/"));
R.rules.push(new Rule("^http://audible\\.de/", "https://www.audible.de/"));
a("audible.de");
a("*.audible.de");

R = new RuleSet("Audience Ad Network (partial)");
R.rules.push(new Rule("^http://manage\\.audienceadnetwork\\.com/", "https://manage.audienceadnetwork.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.qwobl\\.net/", "https://$1.qwobl.net/"));
a("manage.audienceadnetwork.com");
a("*.qwobl.net");

R = new RuleSet("AusGamers.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?ausgamers\\.com/(account|ajax|res)/", "https://$1ausgamers.com/$1/"));
a("ausgamers.com");
a("www.ausgamers.com");

R = new RuleSet("Australian Koala Foundation");
R.rules.push(new Rule("^http://(?:www\\.)?savethekoala\\.com/", "https://www.savethekoala.com/"));
a("savethekoala.com");
a("www.savethekoala.com");

R = new RuleSet("Austrian Airlines");
R.rules.push(new Rule("^http://(?:www\\.)?austrian\\.com/", "https://www.austrian.com/"));
a("austrian.com");
a("www.austrian.com");

R = new RuleSet("Authorize.Net");
R.rules.push(new Rule("^http://(developer|community\\.developer|verify|www)\\.authorize\\.net/", "https://$1.authorize.net/"));
R.rules.push(new Rule("^http://authorize\\.net/", "https://www.authorize.net/"));
R.rules.push(new Rule("^https?://(?:www\\.)?authorizenet\\.com/", "https://www.authorize.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?fuzeqna\\.com/", "https://www.fuzeqna.com/"));
a("authorize.net");
a("www.authorize.net");
a("developer.authorize.net");
a("community.developer.authorize.net");
a("verify.authorize.net");
a("authorizenet.com");
a("www.authorizenet.com");
a("fuzeqna.com");
a("www.fuzeqna.com");

R = new RuleSet("Automattic");
R.rules.push(new Rule("^http://(subversion\\.|www\\.)?automattic\\.com/", "https://$1automattic.com/"));
a("automattic.com");
a("*.automattic.com");

R = new RuleSet("Automotive Industries");
R.rules.push(new Rule("^http://(www\\.)?ai(?:\\.ai|-online\\.com)/", "https://$1ai-online.com/"));
a("ai.ai");
a("www.ai.ai");
a("ai-online.com");
a("www.ai-online.com");

R = new RuleSet("Avaaz");
R.rules.push(new Rule("^http://(secure\\.|www\\.)?avaaz\\.org/", "https://secure.avaaz.org/"));
a("avaaz.org");
a("www.avaaz.org");
a("secure.avaaz.org");

R = new RuleSet("Avadirect");
R.rules.push(new Rule("^http://(www\\.)?avadirect\\.com/", "https://www.avadirect.com/"));
a("www.avadirect.com");

R = new RuleSet("Avangate (partial)");
R.rules.push(new Rule("^http://www\\.avangate\\.com/(favicon\\.ico|docs/|images/|template_new/)", "https://www.avangate.com/$1"));
R.rules.push(new Rule("^http://cdn\\.avangate\\.com/web/", "https://www.avangate.com/"));
R.rules.push(new Rule("^http://((arms|download2?|secure)\\.)?avangate\\.com/", "https://$1avangate.com/"));
a("avangate.com");
a("*.avangate.com");

R = new RuleSet("Avanza.se");
R.rules.push(new Rule("^http://www\\.avanza\\.se/", "https://www.avanza.se/"));
R.rules.push(new Rule("^http://avanza\\.se/", "https://www.avanza.se/"));
a("www.Avanza.se");
a("Avanza.se");

R = new RuleSet("Avast");
R.rules.push(new Rule("^http://(forum|support)\\.avast\\.com/", "https://$1.avast.com/"));
a("forum.avast.com");
a("support.avast.com");

R = new RuleSet("Avira");
R.rules.push(new Rule("^http://(?:www\\.)?avira\\.com/", "https://www.avira.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?forum\\.avira\\.com/", "https://forum.avira.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?license\\.avira\\.com/", "https://license.avira.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?analysis\\.avira\\.com/", "https://analysis.avira.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?myaccount\\.avira\\.com/", "https://myaccount.avira.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?partnernet\\.avira\\.com/", "https://partnernet.avira.com/"));
a("www.avira.com");
a("avira.com");
a("forum.avira.com");
a("license.avira.com");
a("analysis.avira.com");
a("myaccount.avira.com");
a("partnernet.avira.com");

R = new RuleSet("Avropa.se");
R.rules.push(new Rule("^http://www\\.avropa\\.se/", "https://www.avropa.se/"));
R.rules.push(new Rule("^http://avropa\\.se/", "https://avropa.se/"));
a("www.avropa.se");
a("avropa.se");

R = new RuleSet("AwesomeJar.com");
R.rules.push(new Rule("^http://(www\\.)?awesomejar\\.com/", "https://awesomejar.com/"));
a("awesomejar.com");
a("www.awesomejar.com");

R = new RuleSet("Awio Web Services (partial)");
R.rules.push(new Rule("^http://app\\.dialshield\\.com/", "https://app.dialshield.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?visitorboost\\.com/", "https://www.visitorboost.com/"));
R.rules.push(new Rule("^http://(www\\.)?w3roi\\.com/", "https://$1w3roi.com/"));
a("app.dialshield.com");
a("visitorboost.com");
a("*.visitorboost.com");
a("w3roi.com");
a("*.w3roi.com");

R = new RuleSet("Axamba (partial)");
R.rules.push(new Rule("^http://my\\.webtapestry\\.net/", "https://my.webtapestry.net/"));
a("my.webtapestry.net");

R = new RuleSet("Axel Springer (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?aufeminin\\.com/(a/|[\\w\\W]+(\\.(css|gif|ico|jpg|png)|\\?lsh|v=[\\d\\.]+))", "https://www.aufeminin.com/$1"));
R.rules.push(new Rule("^http://network\\.aufeminin\\.com/call/pubimppixel/\\d{7,7}/\\d+\\??", "https://im2.smartserver.com/images/shim.gif"));
R.rules.push(new Rule("^http://(?:www\\.)?smartadserver\\.com/(images/)?shim\\.gif$", "https://www.smartadserver.com/$1shim.gif"));
R.rules.push(new Rule("^http://(?:akamai\\.smartadserver|ced\\.sascdn)\\.com/", "https://im2.smartserver.com/"));
R.rules.push(new Rule("^http://(im2|manage)\\.smartadserver\\.com/", "https://$1.smartadserver.com/"));
R.exclusions.push(new Exclusion("^http://www\\.aufeminin\\.com/.+(\\.asp$|/)"));
a("aufeminin.com");
a("*.aufeminin.com");
a("ced.sascdn.com");
a("smartadserver.com");
a("*.smartadserver.com");

R = new RuleSet("Azingsport.se");
R.rules.push(new Rule("^http://www\\.azingsport\\.se/", "https://www.azingsport.se/"));
R.rules.push(new Rule("^http://azingsport\\.se/", "https://azingsport.se/"));
a("www.azingsport.se");
a("azingsport.se");

R = new RuleSet("BritishAirways");
R.rules.push(new Rule("^http://shopping\\.ba\\.com/", "https://www.britishairways.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?britishairways\\.com/", "https://www.britishairways.com/"));
a("shopping.ba.com");
a("britishairways.com");
a("www.britishairways.com");

R = new RuleSet("BBC (partial)");
R.rules.push(new Rule("^http://(sa|static)\\.bbci?\\.co\\.uk/", "https://$1.bbc.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?bbc\\.co\\.uk/(favicon\\.ico$|glow/|guidance/|iplayer/)", "https://www.bbc.co.uk/$1"));
R.rules.push(new Rule("^http://node[12]\\.bbcimg\\.co\\.uk/iplayer/", "https://www.bbc.co.uk/iplayer/"));
a("bbc.co.uk");
a("sa.bbc.co.uk");
a("*.bbc.co.uk");
a("static.bbci.co.uk");
a("node1.bbcimg.co.uk");

R = new RuleSet("BCGolf.com");
R.rules.push(new Rule("^http://(www\\.)?bcgolf\\.com/", "https://$1bcgolf.com/"));
R.rules.push(new Rule("^http://(www\\.)?golf2go\\.net/", "https://$1golf2go.net/"));
a("bcgolf.com");
a("www.bcgolf.com");
a("golf2go.net");
a("www.golf2go.net");

R = new RuleSet("BKK-Advita");
R.rules.push(new Rule("^http://(?:www\\.)?bkk-advita\\.de/", "https://www.bkk-advita.de/"));
a("www.bkk-advita.de");
a("bkk-advita.de");

R = new RuleSet("BKW-FMB.ch");
R.rules.push(new Rule("^http://(?:www\\.)?bkw-fmb\\.ch/", "https://www.bkw-fmb.ch/"));
a("bkw-fmb.ch");
a("www.bkw-fmb.ch");

R = new RuleSet("BankOfNewZeland");
R.rules.push(new Rule("^http://(?:www\\.)?bnz\\.co\\.nz/", "https://www.bnz.co.nz/"));
a("bnz.co.nz");
a("www.bnz.co.nz");

R = new RuleSet("Boe.es");
R.rules.push(new Rule("^http://boe\\.es/", "https://www.boe.es/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.boe\\.es/", "https://$1.boe.es/"));
a("boe.es");
a("*.boe.es");

R = new RuleSet("BPS (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?bps\\.org\\.uk/sites/default/(files/cs|theme)s/", "https://www.bps.org.uk/sites/default/$1s/"));
R.rules.push(new Rule("^http://login\\.bps\\.org\\.uk/", "https://login.bps.org.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?bpsshop\\.org\\.uk/((App_Theme|Asset|image)s/|login\\.aspx)", "https://www.bpsshop.org.uk/$1"));
a("bps.org.uk");
a("*.bps.org.uk");
a("bpsshop.org.uk");
a("www.bpsshop.org.uk");

R = new RuleSet("BT Group (partial)");
R.rules.push(new Rule("^http://(www\\.)?bt\\.com/", "https://www.bt.com/"));
R.rules.push(new Rule("^http://(www\\.)?(global|productsand)services\\.bt\\.com/", "https://www.$2services.bt.com/"));
R.rules.push(new Rule("^http://www\\.btplc\\.com/", "https://www.btplc.com/"));
R.rules.push(new Rule("^http://(www\\.)?dabs\\.com/(account|Article\\.aspx|articles/|brands/.+|[cC]ss/|checkout|clearance-corner|forum/.+|go/|[iI]mages/|learn-more|my-dabs|products/recently-viewed|register|[sS]cripts/|wishlist)", "https://www.dabs.com/$2"));
R.rules.push(new Rule("^http://reporting\\.dabs\\.com/", "https://reporting.dabs.com/"));
R.exclusions.push(new Exclusion("^http://business\\.bt\\.com/"));
a("*.bt.com");
a("www.global.bt.com");
a("www.btplc.com");
a("dabs.com");
a("reporting.dabs.com");
a("www.dabs.com");

R = new RuleSet("BT");
R.rules.push(new Rule("^http://(?:www\\.)?bt\\.com/", "https://www.bt.com/"));
a("www.bt.com");
a("bt.com");

R = new RuleSet("BTCGuild.com");
R.rules.push(new Rule("^http://(?:www\\.)?btcguild\\.com/", "https://www.btcguild.com/"));
a("btcguild.com");
a("www.btcguild.com");

R = new RuleSet("BTDigg");
R.rules.push(new Rule("^http://(?:www\\.)?btdigg\\.org/", "https://btdigg.org/"));
a("btdigg.org");
a("www.btdigg.org");

R = new RuleSet("BTGuard.com");
R.rules.push(new Rule("^http://(?:www\\.)?(affiliate\\.)?btguard\\.com/", "https://$1btguard.com/"));
a("btguard.com");
a("*.btguard.com");

R = new RuleSet("BTH.se");
R.rules.push(new Rule("^http://bth\\.se/", "https://www.bth.se/"));
R.rules.push(new Rule("^http://www\\.bth\\.se/", "https://www.bth.se/"));
a("www.bth.se");
a("bth.se");

R = new RuleSet("BTunnel");
R.rules.push(new Rule("^http://(?:www\\.)?btunnel\\.com/", "https://btunnel.com/"));
a("btunnel.com");
a("www.btunnel.com");

R = new RuleSet("Brigham Young University (partial)");
R.rules.push(new Rule("^((http://(www\\.)?)|(https://www\\.))(alumni2|alumni3|animation|asme|assess|at|barbershop|blackboard|bookexchange|booklist|byuems|byusa|cac|calendar|ccr|cheme|chemicalengineering|cles|clsupport|comd|cougarprints|coursemanagement|cpms|creativeworks|(((accounts|docs|faculty|facwiki|help|labs|mail|students|tick)\\.)?cs)|delegate|developer|education|edward|eroom|((org|pml)\\.et)|events|examstat|facultyprofile|finserve|finserve-dev|gamescenter|gamma|gamma-stg|gardner|globalcareer|go|gradebook|home|honorcode|hrms|inshop|internationalservices|irbtutorial|it|itmedia|ittest|jobs|kennedy|kronprod|lambda|leadershiped|lockers|lodges|login|map|marylou|(mail01\\.)?math|mathed|multicultural|news|newsnet|oit|online|online1|online2|orca|(mail\\.physics)|pmpc|pmpcapps|police|printandmail|purchasing|redefineservice|remedy|risk|ry|sa|saas|sasapps|scheduling|software|spiral|stab|stleader|stokes|studentratings|testing|tutoring|uac|unicomm|volta|webmail|wilk|www|y|yfacts|yjobs|yscience)\\.byu\\.edu/", "https://$5.byu.edu/"));
R.rules.push(new Rule("^((http://(www\\.)?)|(https://))((acerc|et|chem|physics)\\.)?byu\\.edu/", "https://www.$5byu.edu/"));
R.rules.push(new Rule("^http://((secure\\.chem)|(support\\.cheme)|((contentdm|listserver)\\.lib))\\.byu\\.edu/", "https://$1.byu.edu/"));
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.groups\\.et\\.byu\\.net/", "https://$1.groups.et.byu.net/"));
R.exclusions.push(new Exclusion("^http://cpms\\.byu\\.edu/content/"));
R.exclusions.push(new Exclusion("^http://cpms\\.byu\\.edu/newsletters/StudentNews/"));
R.exclusions.push(new Exclusion("^http://cpms\\.byu\\.edu/ESM(/|$)"));
R.exclusions.push(new Exclusion("^http://(www\\.)?byu\\.edu/(on|off)campushousing(/|$)"));
R.exclusions.push(new Exclusion("^http://(www\\.)?byu\\.edu/familyhousing(/|$)"));
R.exclusions.push(new Exclusion("^http://(www\\.)?byu\\.edu/housing(/|$)"));
R.exclusions.push(new Exclusion("^http://www\\.physics\\.byu\\.edu/Graduate/?$"));
R.exclusions.push(new Exclusion("^http://www\\.physics\\.byu\\.edu/Graduate/(D|d)efault\\.aspx($|(\\?))"));
a("byu.edu");
a("*.byu.edu");
a("www.*.byu.edu");
a("*.cs.byu.edu");
a("www.*.cs.byu.edu");
a("*.et.byu.edu");
a("www.*.et.byu.edu");
a("*.lib.byu.edu");
a("mail01.math.byu.edu");
a("mail.physics.byu.edu");
a("secure.chem.byu.edu");
a("support.cheme.byu.edu");
a("*.groups.et.byu.net");

R = new RuleSet("Backstreet International Merchandise");
R.rules.push(new Rule("^http://(www\\.)?backstreet(-)?merch\\.com/", "https://$1backstreet$2merch.com/"));
a("backstreetmerch.com");
a("www.backstreetmerch.com");
a("backstreet-merch.com");
a("www.backstreet-merch.com");

R = new RuleSet("Backupify");
R.rules.push(new Rule("^http://(?:www\\.)?backupify\\.com/", "https://www.backupify.com/"));
a("backupify.com");
a("www.backupify.com");

R = new RuleSet("Badongo (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?badongo\\.com/(inc/|(imag|styl)es/|login)", "https://www.badongo.com/$1"));
R.rules.push(new Rule("^http://cdn\\d\\w\\.badongo\\.com/\\w{1,6}/(imag|styl)es/", "https://www.badongo.com/$1es/"));
a("badongo.com");
a("*.badongo.com");

R = new RuleSet("Badoo.com");
R.rules.push(new Rule("^http://www\\.badoo\\.com/", "https://www.badoo.com/"));
R.rules.push(new Rule("^http://badoo\\.com/", "https://www.badoo.com/"));
a("www.badoo.com");
a("badoo.com");

R = new RuleSet("Badwarebusters.org");
R.rules.push(new Rule("^http://(?:www\\.)?badwarebusters\\.org/", "https://badwarebusters.org/"));
a("badwarebusters.org");
a("www.badwarebusters.org");

R = new RuleSet("Bagatoo.se");
R.rules.push(new Rule("^http://www\\.bagatoo\\.se/", "https://www.bagatoo.se/"));
R.rules.push(new Rule("^http://bagatoo\\.se/", "https://bagatoo.se/"));
a("www.bagatoo.se");
a("bagatoo.se");

R = new RuleSet("Bahn-BKK");
R.rules.push(new Rule("^http://(?:www\\.)?bahn-bkk\\.de/", "https://www.bahn-bkk.de/"));
a("www.bahn-bkk.de");
a("bahn-bkk.de");

R = new RuleSet("Bahn.de");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.bahn\\.de/", "https://$1.bahn.de/"));
R.exclusions.push(new Exclusion("^http://bauarbeiten\\.bahn\\.de/"));
a("*.bahn.de");
a("bahn.de");

R = new RuleSet("Balatarin");
R.rules.push(new Rule("^http://(?:www\\.)?balatarin\\.com/", "https://balatarin.com/"));
a("balatarin.com");
a("www.balatarin.com");

R = new RuleSet("Baldershage.se");
R.rules.push(new Rule("^http://www\\.baldershage\\.se/", "https://www.baldershage.se/"));
R.rules.push(new Rule("^http://baldershage\\.se/", "https://baldershage.se/"));
a("www.baldershage.se");
a("baldershage.se");

R = new RuleSet("Balkongshoppen.se");
R.rules.push(new Rule("^http://www\\.balkongshoppen\\.se/", "https://www.balkongshoppen.se/"));
R.rules.push(new Rule("^http://balkongshoppen\\.se/", "https://balkongshoppen.se/"));
a("www.balkongshoppen.se");
a("balkongshoppen.se");

R = new RuleSet("Ballicom");
R.rules.push(new Rule("^http://(www\\.)?ballicom\\.co\\.uk/", "https://www.ballicom.co.uk/"));
a("ballicom.co.uk");
a("www.ballicom.co.uk");

R = new RuleSet("Bandcamp");
R.rules.push(new Rule("^http://(?:www\\.)?bandcamp\\.com/", "https://bandcamp.com/"));
a("bandcamp.com");
a("www.bandcamp.com");

R = new RuleSet("Bankofscotland.de");
R.rules.push(new Rule("^http://bankofscotland\\.de/", "https://www.bankofscotland.de/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.bankofscotland\\.de/", "https://$1.bankofscotland.de/"));
a("bankofscotland.de");
a("*.bankofscotland.de");

R = new RuleSet("bankrate.com");
R.rules.push(new Rule("^http://(?:www\\.)?bankrate\\.com/", "https://origin.bankrate.com/"));
a("bankrate.com");
a("www.bankrate.com");

R = new RuleSet("Barclays");
R.rules.push(new Rule("^http://(?:www\\.)?barclays\\.co\\.uk/", "https://www.barclays.co.uk/"));
R.rules.push(new Rule("^http://ask\\.barclays\\.co\\.uk/", "https://ask.barclays.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?barclayscorporate\\.com/", "https://www.barclayscorporate.com/"));
R.rules.push(new Rule("^http://(?:secure\\.)?barclaycard\\.co\\.uk/", "https://www.barclaycard.co.uk/"));
R.rules.push(new Rule("^http://(www|bcol|letmechoose|ask|spendmanagement)\\.(?:secure\\.)?barclaycard\\.co\\.uk/", "https://$1.barclaycard.co.uk/"));
a("www.barclays.co.uk");
a("barclays.co.uk");
a("ask.barclays.co.uk");
a("barclayscorporate.com");
a("www.barclayscorporate.com");
a("barclaycard.co.uk");
a("*.barclaycard.co.uk");
a("*.secure.barclaycard.co.uk");

R = new RuleSet("Barmer-GEK");
R.rules.push(new Rule("^http://(?:www\\.)?barmer-gek\\.de/", "https://www.barmer-gek.de/"));
a("www.barmer-gek.de");
a("barmer-gek.de");

R = new RuleSet("Barnes and Noble (partial)");
R.rules.push(new Rule("^http://(www\\.)?barnesandnoble\\.com/", "https://www.barnesandnoble.com/"));
R.exclusions.push(new Exclusion("http://www\\.barnesandnoble\\.com/[sw]/"));
a("www.barnesandnoble.com");
a("barnesandnoble.com");

R = new RuleSet("Barnskospecialisten.se");
R.rules.push(new Rule("^http://www\\.barnskospecialisten\\.se/", "https://www.barnskospecialisten.se/"));
R.rules.push(new Rule("^http://barnskospecialisten\\.se/", "https://barnskospecialisten.se/"));
a("www.barnskospecialisten.se");
a("barnskospecialisten.se");

R = new RuleSet("Beatsmedia");
R.rules.push(new Rule("^http://(www\\.)?beatsmedia\\.com/", "https://$1beatsmedia.com/"));
a("beatsmedia.com");
a("www.beatsmedia.com");

R = new RuleSet("Belpino.se");
R.rules.push(new Rule("^http://www\\.belpino\\.se/", "https://www.belpino.se/"));
R.rules.push(new Rule("^http://belpino\\.se/", "https://belpino.se/"));
a("www.belpino.se");
a("belpino.se");

R = new RuleSet("Bendigo Bank");
R.rules.push(new Rule("^http://bendigobank\\.com\\.au/", "https://www.bendigobank.com.au/"));
R.rules.push(new Rule("^http://(edroom|m|shop|www)\\.bendigobank\\.com\\.au/", "https://$1.bendigobank.com.au/"));
a("bendigobank.com.au");
a("*.bendigobank.com.au");

R = new RuleSet("bepress");
R.rules.push(new Rule("^http://(\\w+\\.)?bepress\\.com/", "https://$1bepress.com/"));
a("bepress.com");
a("*.bepress.com");

R = new RuleSet("Berkeley Chess School (partial)");
R.rules.push(new Rule("^http://(www\\.)?berkeleychessschool\\.org/(imgs|images|stylesheets)/", "https://$1berkeleychessschool.org/$2/"));
a("berkeleychessschool.org");
a("www.berkeleychessschool.org");

R = new RuleSet("Berklee College of Music");
R.rules.push(new Rule("^http://apply\\.berklee\\.edu/", "https://apply.berklee.edu/"));
a("apply.berklee.edu");

R = new RuleSet("Berkshire-Hathaway (partial)");
R.rules.push(new Rule("^http://businesswire\\.com/", "https://www.businesswire.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?businesswire\\.com/(css/|images/|portal/(binary|site/home/(template\\.LOGIN|index\\.jsp\\?epi-content=[\\w&=]+wizardName=userreg)))", "https://www.businesswire.com/$1"));
R.rules.push(new Rule("^http://connect\\.businesswire\\.com/", "https://connect.businesswire.com/"));
R.rules.push(new Rule("^http://cts\\.businesswire\\.com/ct/CT\\?id=", "https://www.businesswire.com/images/spacer.gif"));
R.rules.push(new Rule("^http://mms\\.businesswire\\.com/bwapps/mediaserver/", "https://connect.businesswire.com/bwapps/mediaserver/"));
a("businesswire.com");
a("*.businesswire.com");

R = new RuleSet("Berlin.de");
R.rules.push(new Rule("^http://berlin\\.de/", "https://berlin.de/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.berlin\\.de/", "https://$1.berlin.de/"));
R.exclusions.push(new Exclusion("^http://action\\.berlin\\.de/"));
R.exclusions.push(new Exclusion("^http://daten\\.berlin\\.de/"));
a("www.berlin.de");
a("berlin.de");
a("*.berlin.de");

R = new RuleSet("Bestofmedia (partial)");
R.rules.push(new Rule("^http://(static\\.|www\\.)?computing\\.net/", "https://www.computing.net/"));
R.rules.push(new Rule("^http://(www\\.)?tomshw\\.it/", "https://www.tomshw.it/"));
a("computing.net");
a("static.computing.net");
a("www.computing.net");
a("tomshw.it");
a("www.tomshw.it");

R = new RuleSet("bet365 Group (partial)");
R.rules.push(new Rule("^http://bet365\\.com/", "https://www.bet365.com/"));
R.rules.push(new Rule("^http://(members|www)\\.bet365\\.com/", "https://members.bet365.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?bet365affiliates\\.com/", "https://www.bet365affiliates.com/"));
a("bet365.com");
a("*.bet365.com");
a("bet365affiliates.com");
a("www.bet365affiliates.com");

R = new RuleSet("Beta & Cie (partial)");
R.rules.push(new Rule("^http://cdn\\.betacie\\.(?:com|net)/", "https://cdn.betacie.net/"));
R.rules.push(new Rule("^http://(www\\.)?fmylife\\.com/", "https://$1fmylife.com/"));
R.rules.push(new Rule("^http://cdn\\d\\.(?:fmylife\\.com|viedemerde\\.fr)/", "https://betacie.cachefly.net/"));
R.rules.push(new Rule("^http://(www\\.)?viedemerde\\.fr/", "https://$1viedemerde.fr/"));
a("cdn.betacie.com");
a("cdn.betacie.net");
a("fmylife.com");
a("*.fmylife.com");
a("viedemerde.fr");
a("*.viedemerde.fr");

R = new RuleSet("Betnet.fr");
R.rules.push(new Rule("^http://(www\\.)?betnet\\.fr/", "https://www.betnet.fr/"));
a("betnet.fr");
a("www.betnet.fr");

R = new RuleSet("Betram Trading (partial)");
R.rules.push(new Rule("^http://images\\.bertrams\\.com/", "https://images.bertrams.com/"));
a("images.bertrams.com");

R = new RuleSet("Better Business Bureau (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?la\\.?bbb\\.org/", "https://www.labbb.org/"));
R.rules.push(new Rule("^http://bbb\\.org/", "https://www.bbb.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?([\\w\\-]+)\\.bbb\\.org/", "https://$1.bbb.org/"));
R.rules.push(new Rule("^http://hurdman\\.app\\.bbb\\.org/", "https://hurdman.app.bbb.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?bbbonline\\.org/cks\\.asp\\?id=(\\d+)", "https://www.bbb.org/us/bbb-online-business/?id=$1"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?dc\\."));
R.exclusions.push(new Exclusion("http://(?:www\\.)?seflorida\\."));
a("bbb.org");
a("hurdman.app.bbb.org");
a("*.bbb.org");
a("www.*.bbb.org");
a("bbbonline.org");
a("www.bbbonline.org");
a("labbb.org");
a("www.labbb.org");

R = new RuleSet("Beyond Security");
R.rules.push(new Rule("^http://(\\w+\\.)?beyondsecurity\\.com/", "https://$1beyondsecurity.com/"));
a("beyondsecurity.com");
a("*.beyondsecurity.com");

R = new RuleSet("Bhiab.se");
R.rules.push(new Rule("^http://www\\.bhiab\\.se/", "https://www.bhiab.se/"));
R.rules.push(new Rule("^http://bhiab\\.se/", "https://bhiab.se/"));
a("www.bhiab.se");
a("bhiab.se");

R = new RuleSet("Bidz.com (partial)");
R.rules.push(new Rule("^http://bidz\\.com/", "https://www.bidz.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.bidz\\.com/", "https://$1.bidz.com/"));
R.exclusions.push(new Exclusion("^http://blog\\."));
a("bidz.com");
a("*.bidz.com");

R = new RuleSet("German BigBrotherAwards");
R.rules.push(new Rule("^http://(?:www\\.)?bigbrotherawards\\.de/", "https://www.bigbrotherawards.de/"));
R.rules.push(new Rule("^https://bigbrotherawards\\.de/", "https://www.bigbrotherawards.de/"));
a("bigbrotherawards.de");
a("www.bigbrotherawards.de");

R = new RuleSet("BigCommerce");
R.rules.push(new Rule("^http://(my)?bigcommerce\\.com/", "https://www.bigcommerce.com/"));
R.rules.push(new Rule("^http://(account|apps|support|www)\\.bigcommerce\\.com/", "https://$1.bigcommerce.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.mybigcommerce\\.com/", "https://$1.mybigcommerce.com/"));
R.rules.push(new Rule("^http://(www\\.)?interspire\\.com/", "https://www.interspire.com/"));
R.exclusions.push(new Exclusion("^http://www\\.mybigcommerce\\.com/$"));
a("bigcommerce.com");
a("account.bigcommerce.com");
a("apps.bigcommerce.com");
a("support.bigcommerce.com");
a("www.bigcommerce.com");
a("mybigcommerce.com");
a("*.mybigcommerce.com");
a("interspire.com");
a("www.interspire.com");

R = new RuleSet("Bigmirnet (partial)");
R.rules.push(new Rule("^http://(auto|dnevnik|i|ivona)\\.bigmir\\.net/", "https://$1.bigmir.net/"));
a("auto.bigmir.net");
a("dnevnik.bigmir.net");
a("i.bigmir.net");
a("ivona.bigmir.net");

R = new RuleSet("BinRev");
R.rules.push(new Rule("^http://(?:www\\.)?binrev\\.com/", "https://binrev.com/"));
a("www.binrev.com");
a("binrev.com");

R = new RuleSet("BinSearch");
R.rules.push(new Rule("^http://(?:www\\.)?binsearch\\.info/", "https://www.binsearch.info/"));
R.rules.push(new Rule("^http://(?:www\\.)?binsearch\\.net/", "https://www.binsearch.info/"));
a("www.binsearch.info");
a("binsearch.info");
a("www.binsearch.net");
a("binsearch.net");

R = new RuleSet("Binary Biz");
R.rules.push(new Rule("^http://(www\\.)?binarybiz\\.com/", "https://$1binarybiz.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?totalrecall\\.com/", "https://www.totalrecall.com/"));
a("binarybiz.com");
a("www.binarybiz.com");
a("totalrecall.com");
a("www.totalrecall.com");

R = new RuleSet("BinaryTurf");
R.rules.push(new Rule("^http://(?:www\\.)?binaryturf\\.com/", "https://www.binaryturf.com/"));
R.rules.push(new Rule("^http://forums\\.binaryturf\\.com/", "https://www.binaryturf.com/forum/"));
a("binaryturf.com");
a("www.binaryturf.com");
a("forums.binaryturf.com");

R = new RuleSet("Binero.se");
R.rules.push(new Rule("^http://binero\\.se/", "https://www.binero.se/"));
R.rules.push(new Rule("^http://support\\.binero\\.se/", "https://support.binero.se/"));
R.rules.push(new Rule("^http://order\\.binero\\.se/", "https://order.binero.se/"));
R.rules.push(new Rule("^http://www\\.binero\\.se/", "https://www.binero.se/"));
a("binero.se");

R = new RuleSet("Birthprint");
R.rules.push(new Rule("^http://(www\\.)?birthprint\\.com/", "https://www.birthprint.com/"));
a("birthprint.com");
a("www.birthprint.com");

R = new RuleSet("BitBucket");
R.rules.push(new Rule("^http://(?:www\\.)?bitbucket\\.org/", "https://bitbucket.org/"));
a("www.bitbucket.org");
a("bitbucket.org");

R = new RuleSet("BitRock (partial)");
R.rules.push(new Rule("^http://www\\.bitnamihosting\\.com/", "https://app.bitnamihosting.com/"));
R.rules.push(new Rule("^http://(app\\.)?bitnamihosting\\.com/", "https://$1bitnamihosting.com/"));
a("bitnamihosting.com");
a("*.bitnamihosting.com");

R = new RuleSet("Bitcoin Forum");
R.rules.push(new Rule("^http://(www\\.)?bitcointalk\\.org/", "https://$1bitcointalk.org/"));
a("bitcointalk.org");
a("www.bitcointalk.org");

R = new RuleSet("bitGamer");
R.rules.push(new Rule("^http://(www\\.)?bitgamer\\.su/", "https://bitgamer.su/"));
R.rules.push(new Rule("^http://(www\\.)?bitgamer\\.com/", "https://bitgamer.su/"));
R.rules.push(new Rule("^https://(www\\.)?bitgamer\\.com/", "https://bitgamer.su/"));
a("www.bitgamer.su");
a("bitgamer.su");
a("www.bitgamer.com");
a("bitgamer.com");

R = new RuleSet("bit.ly");
R.rules.push(new Rule("^http://(?:www\\.)?bit\\.ly/", "https://bit.ly/"));
R.rules.push(new Rule("^http://s\\.bit\\.ly/", "https://s3.amazonaws.com/s.bit.ly/"));
R.rules.push(new Rule("^http://(?:www\\.)?bitly\\.com/", "https://bitly.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?bit\\.?ly\\.pro/", "https://bitly.com/pro/"));
R.rules.push(new Rule("^http://(?:www\\.)?j\\.mp/", "https://bit.ly/"));
R.rules.push(new Rule("^http://on\\.fb\\.me/", "https://bit.ly/"));
a("bit.ly");
a("*.bit.ly");
a("bit.ly.pro");
a("www.bit.ly.pro");
a("bitly.pro");
a("www.bitly.pro");
a("j.mp");
a("www.j.mp");
a("on.fb.me");
a("bitly.com");
a("www.bitly.com");

R = new RuleSet("BlackHat");
R.rules.push(new Rule("^http://(?:www\\.)?blackhat\\.com/", "https://www.blackhat.com/"));
a("blackhat.com");
a("www.blackhat.com");

R = new RuleSet("Black Night");
R.rules.push(new Rule("^http://(?:www\\.)?blacknight\\.com/", "https://www.blacknight.com/"));
a("www.blacknight.com");
a("blacknight.com");

R = new RuleSet("Blackberry (partial)");
R.rules.push(new Rule("^http://appworld\\.blackberry\\.com/", "https://appworld.blackberry.com/"));
a("appworld.blackberry.com");

R = new RuleSet("BlameStella");
R.rules.push(new Rule("^http://(?:www\\.)?blamestella\\.com/", "https://www.blamestella.com/"));
a("blamestella.com");
a("www.blamestella.com");

R = new RuleSet("Blau.de");
R.rules.push(new Rule("^http://([^/:@]*)\\.blau\\.de/", "https://$1.blau.de/"));
a("*.blau.de");
a("blau.de");

R = new RuleSet("Blekko");
R.rules.push(new Rule("^http://(?:www\\.)?blekko\\.com/", "https://blekko.com/"));
a("blekko.com");
a("www.blekko.com");

R = new RuleSet("Blip");
R.rules.push(new Rule("^http://(?:www\\.|a\\.)?blip\\.tv/", "https://blip.tv/"));
a("blip.tv");
a("www.blip.tv");
a("a.blip.tv");

R = new RuleSet("Blipp.com");
R.rules.push(new Rule("^http://www\\.blipp\\.com/", "https://blipp.com/"));
R.rules.push(new Rule("^http://vic20\\.blipp\\.com/", "https://vic20.blipp.com/"));
R.rules.push(new Rule("^http://blipp\\.com/", "https://blipp.com/"));
a("blipp.com");
a("www.blipp.com");
a("vic20.blipp.com");

R = new RuleSet("BlockBuster UK");
R.rules.push(new Rule("^http://(?:www\\.)?blockbuster\\.co\\.uk/", "https://www.blockbuster.co.uk/"));
a("www.blockbuster.co.uk");
a("blockbuster.co.uk");

R = new RuleSet("BlockExplorer.com");
R.rules.push(new Rule("^http://(?:www\\.)?blockexplorer\\.com/", "https://blockexplorer.com/"));
a("blockexplorer.com");
a("www.blockexplorer.com");

R = new RuleSet("BlockScript");
R.rules.push(new Rule("^http://(?:www\\.)?blockscript\\.com/", "https://www.blockscript.com/"));
a("blockscript.com");
a("www.blockscript.com");

R = new RuleSet("Blocket.se");
R.rules.push(new Rule("^http://blocket\\.se/", "https://www.blocket.se/"));
R.rules.push(new Rule("^http://www\\.blocket\\.se/", "https://www.blocket.se/"));
R.rules.push(new Rule("^http://www2\\.blocket\\.se/", "https://www2.blocket.se/"));
R.rules.push(new Rule("^http://eas\\.blocket\\.se/", "https://eas.blocket.se/"));
a("blocket.se");
a("www.blocket.se");
a("www2.blocket.se");
a("eas.blocket.se");

R = new RuleSet("Blogger (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?blogger\\.com/(img|static)/", "https://www.blogger.com/$1/"));
R.rules.push(new Rule("^http://(?:\\w+)\\.blog(?:ger|spot)\\.co(?:m|\\.uk)/favicon\\.ico", "https://www.blogger.com/favicon.ico"));
a("blogger.com");
a("*.blogger.com");
a("blogger.co.uk");
a("*.blogger.co.uk");
a("blogspot.com");
a("*.blogspot.com");
a("blogspot.co.uk");
a("*.blogspot.co.uk");

R = new RuleSet("BlueCoat");
R.rules.push(new Rule("^http://www\\.bluecoat\\.com/", "https://www.bluecoat.com/"));
a("www.bluecoat.com");

R = new RuleSet("BlueSnap");
R.rules.push(new Rule("^http://primus\\.com/", "https://www.primus.com/"));
R.rules.push(new Rule("^http://(home|ru|secure|www)\\.primus\\.com/", "https://$1.primus.com/"));
a("primus.com");
a("*.primus.com");

R = new RuleSet("BlueHost");
R.rules.push(new Rule("^http://(?:www\\.)?bluehost\\.com/", "https://www.bluehost.com/"));
R.rules.push(new Rule("^http://(helpdesk|tutorials)\\.bluehost\\.com/", "https://$1.bluehost.com/"));
R.rules.push(new Rule("^http://serverstatus\\.bluehost\\.com/$", "https://www.bluehost.com/cgi/serverstatus/"));
a("www.bluehost.com");
a("bluehost.com");
a("helpdesk.bluehost.com");
a("tutorials.bluehost.com");
a("serverstatus.bluehost.com");

R = new RuleSet("Bmibaby.com");
R.rules.push(new Rule("^http://www\\.bmibaby\\.com/", "https://www.bmibaby.com/"));
a("www.bmibaby.com");

R = new RuleSet("Boards.ie");
R.rules.push(new Rule("^http://boards\\.ie/", "https://boards.ie/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.boards\\.ie/", "https://$1.boards.ie/"));
a("boards.ie");
a("*.boards.ie");

R = new RuleSet("Bodum");
R.rules.push(new Rule("^http://(?:www\\.)?bodum\\.com/", "https://www.bodum.com/"));
a("bodum.com");
a("www.bodum.com");

R = new RuleSet("Boell.de");
R.rules.push(new Rule("^http://groupwise\\.boell\\.de/", "https://groupwise.boell.de/"));
a("groupwise.boell.de");

R = new RuleSet("Boinc");
R.rules.push(new Rule("^http://(?:www\\.)?boinc\\.berkeley\\.edu/", "https://boinc.berkeley.edu/"));
a("boinc.berkeley.edu");
a("www.boinc.berkeley.edu");

R = new RuleSet("Bokborgen.se");
R.rules.push(new Rule("^http://www\\.bokborgen\\.se/", "https://bokborgen.se/"));
R.rules.push(new Rule("^http://bokborgen\\.se/", "https://bokborgen.se/"));
a("www.bokborgen.se");
a("bokborgen.se");

R = new RuleSet("Bokelskere");
R.rules.push(new Rule("^http://bokelskere\\.no/", "https://bokelskere.no/"));
R.rules.push(new Rule("^http://www\\.bokelskere\\.no/", "https://www.bokelskere.no/"));
a("bokelskere.no");
a("www.bokelskere.no");

R = new RuleSet("Bolagsverket.se");
R.rules.push(new Rule("^http://bolagsverket\\.se/", "https://www.bolagsverket.se/"));
R.rules.push(new Rule("^http://www\\.bolagsverket\\.se/", "https://www.bolagsverket.se/"));
a("bolagsverket.se");
a("www.bolagsverket.se");

R = new RuleSet("Boltbus.com");
R.rules.push(new Rule("^http://(?:www\\.)?boltbus\\.com/", "https://www.boltbus.com/"));
a("boltbus.com");
a("www.boltbus.com");

R = new RuleSet("BookMyName");
R.rules.push(new Rule("^http://(?:www\\.)?bookmyname\\.com/", "https://www.bookmyname.com/"));
a("www.bookmyname.com");
a("bookmyname.com");

R = new RuleSet("Booking.com");
R.rules.push(new Rule("^http://(?:www\\.)?booking\\.com/", "https://www.booking.com/"));
R.rules.push(new Rule("^http://(admin|bookingbutton|distribution-xml|mobile|xml)\\.booking\\.com/", "https://$1.booking.com/"));
R.rules.push(new Rule("^http://(\\w)\\.bstatic\\.com/", "https://$1.bstatic.com/"));
a("booking.com");
a("*.booking.com");
a("*.bstatic.com");

R = new RuleSet("Booklog.jp");
R.rules.push(new Rule("^http://(?:www\\.)?booklog\\.jp/", "https://www.booklog.jp/"));
a("booklog.jp");
a("www.booklog.jp");

R = new RuleSet("Bookworm");
R.rules.push(new Rule("^http://bookworm\\.oreilly\\.com/", "https://bookworm.oreilly.com/"));
a("bookworm.oreilly.com");

R = new RuleSet("boots.com (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(asia\\.)?boots\\.(com|no)/", "https://www.$1boots.$2/"));
R.rules.push(new Rule("^http://(www\\.)?shopbootsusa\\.com/webstore/(a4j/|login\\.do)", "https://$1shopbootsusa.com/webstore/$2"));
R.rules.push(new Rule("^http://images\\.shopbootsusa\\.com/", "https://images.shopbootsusa.com/"));
a("boots.com");
a("www.boots.com");
a("asia.boots.com");
a("www.asia.boots.com");
a("boots.no");
a("www.boots.no");
a("shopbootsusa.com");
a("*.shopbootsusa.com");

R = new RuleSet("Bothar");
R.rules.push(new Rule("^http://(?:www\\.)?bothar\\.ie/", "https://$1bothar.ie/"));
a("www.bothar.ie");
a("bothar.ie");

R = new RuleSet("boum.org");
R.rules.push(new Rule("^http://boum\\.org/", "https://boum.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.boum\\.org/", "https://$1.boum.org/"));
a("boum.org");
a("*.boum.org");

R = new RuleSet("BoxUK");
R.rules.push(new Rule("^http://(?:www\\.)?boxuk\\.com/", "https://www.boxuk.com/"));
a("www.boxuk.com");
a("boxuk.com");

R = new RuleSet("Boxee.tv");
R.rules.push(new Rule("^http://(app\\.|www\\.)?boxee\\.tv/", "https://$1boxee.tv/"));
a("boxee.tv");
a("*.boxee.tv");

R = new RuleSet("Brainbench");
R.rules.push(new Rule("^http://(?:www\\.)?brainbench\\.com/", "https://www.brainbench.com/"));
a("www.brainbench.com");
a("brainbench.com");

R = new RuleSet("Brainshark");
R.rules.push(new Rule("^http://(?:www\\.)?brainshark\\.com/", "https://www.brainshark.com/"));
a("brainshark.com");
a("www.brainshark.com");

R = new RuleSet("Braunschweig");
R.rules.push(new Rule("^http://(?:www\\.)?braunschweig\\.de/", "https://www.braunschweig.de/"));
a("www.braunschweig.de");
a("braunschweig.de");

R = new RuleSet("Breakfast Quay (partial)");
R.rules.push(new Rule("^http://code\\.breakfastquay\\.com/", "https://code.breakfastquay.com/"));
a("code.breakfastquay.com");

R = new RuleSet("Brew Your Own");
R.rules.push(new Rule("^http://(www\\.)?byo\\.com/", "https://$1byo.com/"));
a("byo.com");
a("www.byo.com");

R = new RuleSet("briandunning.com");
R.rules.push(new Rule("^http://(www\\.)?briandunning\\.com/", "https://$1briandunning.com/"));
a("briandunning.com");
a("www.briandunning.com");

R = new RuleSet("Britcoin.co.uk");
R.rules.push(new Rule("^http://(?:www\\.)?britcoin\\.co\\.uk/", "https://www.britcoin.co.uk/"));
a("britcoin.co.uk");
a("www.britcoin.co.uk");

R = new RuleSet("brmlab");
R.rules.push(new Rule("^http://(?:www\\.)?brmlab\\.cz/", "https://www.brmlab.cz/"));
a("www.brmlab.cz");
a("brmlab.cz");

R = new RuleSet("Broadband Reports");
R.rules.push(new Rule("^http://(?:www\\.)?dslreports\\.com/", "https://secure.dslreports.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?broadbandreports\\.com/", "https://secure.dslreports.com/"));
a("www.dslreports.com");
a("dslreports.com");
a("www.broadbandreports.com");
a("broadbandreports.com");

R = new RuleSet("BroadcasTheNet");
R.rules.push(new Rule("^http://(cdn\\.|(?:www\\.))?broadcasthe\\.net/", "https://$1broadcasthe.net/"));
a("broadcasthe.net");
a("*.broadcasthe.net");

R = new RuleSet("Broome Community College");
R.rules.push(new Rule("^http://(www\\.)?sunybroome\\.edu/", "https://sunybroome.edu/"));
a("www.sunybroome.edu");
a("sunybroome.edu");

R = new RuleSet("Brown Paper Tickets (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?bpt\\.(?:bz|me)/", "https://www.brownpapertickets.com/"));
R.rules.push(new Rule("^http://m\\.bpt\\.(?:bz|me)/", "https://m.bpt.me/"));
R.rules.push(new Rule("^http://brownpapertickets\\.com/", "https://www.brownpapertickets.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.brownpapertickets\\.com/", "https://$1.brownpapertickets.com/"));
R.exclusions.push(new Exclusion("^http://community\\."));
a("bpt.bz");
a("*.bpt.bz");
a("bpt.me");
a("*.bpt.me");
a("brownpapertickets.com");
a("*.brownpapertickets.com");

R = new RuleSet("BrowserShots");
R.rules.push(new Rule("^http://(?:www\\.)?browsershots\\.org/", "https://browsershots.org/"));
a("browsershots.org");
a("www.browsershots.org");

R = new RuleSet("Buckyballs");
R.rules.push(new Rule("^http://(?:www\\.)?getbuckyballs\\.com/", "https://www.getbuckyballs.com/"));
a("getbuckyballs.com");
a("www.getbuckyballs.com");

R = new RuleSet("Budgetgolf.se");
R.rules.push(new Rule("^http://www\\.budgetgolf\\.se/", "https://www.budgetgolf.se/"));
R.rules.push(new Rule("^http://budgetgolf\\.se/", "https://www.budgetgolf.se/"));
a("www.budgetgolf.se");
a("budgetgolf.se");

R = new RuleSet("BulbMan");
R.rules.push(new Rule("^http://(?:www\\.)?bulbman\\.com/", "https://www.bulbman.com/"));
a("bulbman.com");
a("www.bulbman.com");

R = new RuleSet("BulkSMS");
R.rules.push(new Rule("^http://(?:www\\.)?bulksms\\.co\\.uk/", "https://www.bulksms.co.uk/"));
a("bulksms.co.uk");
a("www.bulksms.co.uk");

R = new RuleSet("Bullguard");
R.rules.push(new Rule("^http://www\\.bullguard\\.com/", "https://www.bullguard.com/"));
R.rules.push(new Rule("^http://bullguard\\.com/", "https://www.bullguard.com/"));
a("bullguard.com");
a("www.bullguard.com");

R = new RuleSet("Bundesnetzagentur");
R.rules.push(new Rule("^http://(?:www\\.)?bundesnetzagentur\\.de/", "https://www.bundesnetzagentur.de/"));
a("bundesnetzagentur.de");
a("www.bundesnetzagentur.de");

R = new RuleSet("Bungie");
R.rules.push(new Rule("^http://(?:www\\.)?bungie\\.net/", "https://www.bungie.net/"));
a("www.bungie.net");
a("bungie.net");

R = new RuleSet("Bunkus.org");
R.rules.push(new Rule("^http://(?:www\\.)?bunkus\\.org/", "https://www.bunkus.org/"));
a("www.bunkus.org");
a("bunkus.org");

R = new RuleSet("Bussgods.se");
R.rules.push(new Rule("^http://(www\\.)?bussgods\\.se/", "https://www.bussgods.se/"));
a("bussgods.se");
a("www.bussgods.se");

R = new RuleSet("Buy Premium Tech (partial)");
R.rules.push(new Rule("^http://secure\\.buypremiumtech\\.net/", "https://secure.buypremiumtech.net/"));
a("secure.buypremiumtech.net");

R = new RuleSet("BuyBoard (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?buyboard\\.com/", "https://$1buyboard.com/"));
R.exclusions.push(new Exclusion("^http://vendor\\."));
a("buyboard.com");
a("*.buyboard.com");

R = new RuleSet("Bytemark.co.uk (partial)");
R.rules.push(new Rule("^http://([fop]\\w+)\\.bytemark\\.co\\.uk/", "https://$1.bytemark.co.uk/"));
a("forum.bytemark.co.uk");
a("order2009.bytemark.co.uk");
a("panel.bytemark.co.uk");

R = new RuleSet("Bytename (partial)");
R.rules.push(new Rule("^http://(www\\.)?bytelove\\.com/", "https://$1bytelove.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?bytelove\\.([ds]e|fr|it|us)/", "https://bytelove.$1/"));
R.rules.push(new Rule("^http://(www\\.)?bytename\\.com/", "https://$1bytename.com/"));
a("bytelove.*");
a("www.bytelove.*");
a("bytename.com");
a("www.bytename.com");

R = new RuleSet("C-Base");
R.rules.push(new Rule("^http://(?:www\\.)?c-base\\.org/", "https://www.c-base.org/"));
R.rules.push(new Rule("^http://(logbuch|wiki)\\.c-base\\.org/", "https://$1.c-base.org/"));
a("www.c-base.org");
a("c-base.org");
a("logbuch.c-base.org");
a("wiki.c-base.org");

R = new RuleSet("CA-PCR.fr");
R.rules.push(new Rule("^http://(?:www\\.)?ca-pca\\.fr/", "https://www.ca-pca.fr/"));
a("www.ca-pca.fr");
a("ca-pca.fr");

R = new RuleSet("CBS (partial)");
R.rules.push(new Rule("^http://(fuse|u[ks])\\.gamespot\\.com/", "https://$1.gamespot.com/"));
R.rules.push(new Rule("^http://last\\.fm/", "https://www.last.fm/"));
R.rules.push(new Rule("^http://www\\.last\\.fm/(join|login|settings/lost(password|username))", "https://www.last.fm/$1"));
R.rules.push(new Rule("^http://cdn\\.la?st\\.fm/", "https://www.last.fm/static/"));
a("*.gamespot.com");
a("last.fm");
a("*.last.fm");
a("cdn.lst.fm");

R = new RuleSet("CDNetworks (partial)");
R.rules.push(new Rule("^http://ssl2?\\.cdngc\\.net/", "https://ssl$1.cdngc.net/"));
R.rules.push(new Rule("^http://cdnetworks\\.co\\.jp/$", "https://www.cdnetworks.co.jp/"));
R.rules.push(new Rule("^http://pantherportal\\.cdnetworks\\.com/", "https://pantherportal.cdnetworks.com/"));
R.rules.push(new Rule("^http://(www\\.)?pantherexpress\\.net/", "https://$1pantherexpress.net/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.pantherssl\\.com/", "https://$1.pantherssl.com/"));
a("ssl.cdngc.net");
a("ssl2.cdngc.net");
a("pantherportal.cdnetworks.com");
a("cdnetworks.co.jp");
a("pantherexpress.net");
a("www.pantherexpress.net");
a("*.pantherssl.com");

R = new RuleSet("CDS Global (partial)");
R.rules.push(new Rule("^http://w1\\.buysub\\.com/", "https://w1.buysub.com/"));
R.rules.push(new Rule("^https?://mycdsglobal\\.com/", "https://www.mycdsglobal.com//"));
R.rules.push(new Rule("^http://(sso|www)\\.mycdsglobal\\.com/", "https://$1.mycdsglobal.com/"));
R.rules.push(new Rule("^http://(www\\.)?sciamdigital\\.com/(ax|(cover)?images)/", "https://$1sciamdigital.com/$2/"));
a("w1.buysub.com");
a("mycdsglobal.com");
a("*.mycdsglobal.com");

R = new RuleSet("CDT");
R.rules.push(new Rule("^http://(?:www\\.)?cdt\\.org/", "https://www.cdt.org/"));
a("www.cdt.org");
a("cdt.org");

R = new RuleSet("CDW and CDW-G");
R.rules.push(new Rule("^http://(?:www\\.)?cdw(g)?\\.com/", "https://www.cdw$1.com/"));
a("www.cdwg.com");
a("www.cdw.com");
a("cdwg.com");
a("cdw.com");

R = new RuleSet("CERT.fi");
R.rules.push(new Rule("^http://www\\.cert\\.fi/", "https://www.cert.fi/"));
R.rules.push(new Rule("^http://cert\\.fi/", "https://www.cert.fi/"));
a("www.cert.fi");
a("cert.fi");

R = new RuleSet("CERT.se");
R.rules.push(new Rule("^http://www\\.cert\\.se/", "https://www.cert.se/"));
R.rules.push(new Rule("^http://cert\\.se/", "https://www.cert.se/"));
a("www.cert.se");
a("cert.se");

R = new RuleSet("Cert");
R.rules.push(new Rule("^http://(www\\.)?cert\\.org/", "https://$1cert.org/"));
a("cert.org");
a("www.cert.org");

R = new RuleSet("CHIP Online (partial)");
R.rules.push(new Rule("^https?://omniture\\.chip\\.eu/", "https://cxo-dcuen-prod.d1.sc.omtrdc.net/"));
a("omniture.chip.eu");

R = new RuleSet("CHL.it");
R.rules.push(new Rule("^http://(www\\.)?chl\\.it/", "https://www.chl.it/"));
a("www.chl.it");
a("chl.it");

R = new RuleSet("CIA Cybersurf");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.cia\\.com/", "https://$1.cia.com/"));
a("cia.com");
a("*.cia.com");

R = new RuleSet("CIBC");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.cibc\\.com/", "https://$1.cibc.com/"));
a("cibc.com");
a("*.cibc.com");

R = new RuleSet("CIO.com.au");
R.rules.push(new Rule("^http://cio\\.com\\.au/", "https://www.cio.com.au/"));
R.rules.push(new Rule("^http://www\\.cio\\.com\\.au/", "https://www.cio.com.au/"));
a("cio.com.au");
a("www.cio.com.au");

R = new RuleSet("CJ");
R.rules.push(new Rule("^http://(?:www\\.)?apmebf\\.com/$", "https://www.cj.com/privacy.html"));
R.rules.push(new Rule("^http://cj\\.com/", "https://www.cj.com/"));
R.rules.push(new Rule("^http://(members|signup|www)\\.cj\\.com/", "https://$1.cj.com/"));
a("apmebf.com");
a("*.apmebf.com");
a("cj.com");
a("*.cj.com");

R = new RuleSet("CMP");
R.rules.push(new Rule("^http://(?:cookies|i)\\.cmpnet\\.com/", "https://i.cmpnet.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?cmpadministration\\.com/", "https://www.cmpadministration.com/"));
a("*.cmpnet.com");
a("cmpadministration.com");
a("www.cmpadministration.com");

R = new RuleSet("CMPXCHG8B");
R.rules.push(new Rule("^http://(lock\\.|www\\.)?cmpxchg8b\\.com/", "https://lock.cmpxchg8b.com/"));
a("cmpxchg8b.com");
a("*.cmpxchg8b.com");

R = new RuleSet("CMSWire");
R.rules.push(new Rule("^http://(www\\.)?cmswire\\.com/", "https://www.cmswire.com/"));
a("www.cmswire.com");
a("cmswire.com");

R = new RuleSet("CPJ");
R.rules.push(new Rule("^http://(?:www\\.)?cpj\\.org/", "https://www.cpj.org/"));
a("www.cpj.org");
a("cpj.org");

R = new RuleSet("CPSC.gov");
R.rules.push(new Rule("^http://(?:www\\.)?cpsc\\.gov/", "https://www.cpsc.gov/"));
a("cpsc.gov");
a("www.cpsc.gov");

R = new RuleSet("cPanel (partial)");
R.rules.push(new Rule("^http://((forums|mt|tickets|www)\\.)?cpanel\\.net/", "https://$1cpanel.net/"));
R.exclusions.push(new Exclusion("^http://docs\\."));
a("cpanel.net");
a("*.cpanel.net");

R = new RuleSet("CRM Metrix");
R.rules.push(new Rule("^http://(?:www\\.)?crm-metrix\\.com/", "https://www.crm-metrix.com/"));
a("www.crm-metrix.com");
a("crm-metrix.com");

R = new RuleSet("CRN (partial)");
R.rules.push(new Rule("^http://i\\.crn\\.com/", "https://i.crn.com/"));
R.rules.push(new Rule("^http://(signin\\.)?crn\\.com/", "https://$1crn.com/"));
R.rules.push(new Rule("^http://www\\.crn\\.com/((cs|image)s/|(login|register)\\.htm)", "https://www.crn.com/$1"));
R.rules.push(new Rule("^http://crn\\.verticalsearchworks\\.com/", "https://ad-secure.firstlightera.com/"));
a("crn.com");
a("i.crn.com");
a("signin.crn.com");
a("www.crn.com");
a("crn.verticalsearchworks.com");

R = new RuleSet("CSIS.dk");
R.rules.push(new Rule("^http://csis\\.dk/", "https://www.csis.dk/"));
R.rules.push(new Rule("^http://www\\.csis\\.dk/", "https://www.csis.dk/"));
a("csis.dk");
a("www.csis.dk");

R = new RuleSet("CSRSupport.com");
R.rules.push(new Rule("^http://www\\.csrsupport\\.com/", "https://www.csrsupport.com/"));
R.rules.push(new Rule("^http://csrsupport\\.com/", "https://www.csrsupport.com/"));
a("www.csrsupport.com");
a("csrsupport.com");

R = new RuleSet("CTERA Networks");
R.rules.push(new Rule("^http://(www\\.)?ctera\\.com/", "https://$1ctera.com/"));
a("ctera.com");
a("www.ctera.com");

R = new RuleSet("CTunnel");
R.rules.push(new Rule("^http://(?:www\\.)?ctunnel\\.com/", "https://ctunnel.com/"));
a("ctunnel.com");
a("www.ctunnel.com");

R = new RuleSet("CVI Melles Griot");
R.rules.push(new Rule("^http://(?:www\\.)?cvimellesgriot\\.com/", "https://www.cvimellesgriot.com/"));
a("www.cvimellesgriot.com");
a("cvimellesgriot.com");

R = new RuleSet("CaceTech");
R.rules.push(new Rule("^http://(?:www\\.)?cacetech\\.com/", "https://www.cacetech.com/"));
a("www.cacetech.com");
a("cacetech.com");

R = new RuleSet("CacheFly");
R.rules.push(new Rule("^http://(?:\\d\\.)?([^@:/\\.]+)\\.cachefly\\.net/", "https://$1.cachefly.net/"));
a("*.cachefly.net");

R = new RuleSet("CafePress (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?cafepress\\.co(m|\\.uk)/content/", "https://www.cafepress.co$1/content/"));
R.rules.push(new Rule("^http://(content|members)\\.cafepress\\.co(m|\\.uk)/", "https://$1.cafepress.co$2/"));
R.rules.push(new Rule("^http://shop\\.cafepress\\.com/$", "https://shop.cafepress.com/"));
R.rules.push(new Rule("^http://help\\.cafepress\\.com/hc/", "https://server.iad.liveperson.net/hc/"));
R.rules.push(new Rule("^http://content\\d?\\.cpcache\\.com/", "https://content.cafepress.com/"));
R.rules.push(new Rule("^https://server\\.iad\\.liveperson\\.net/make/", "https://www.cafepress.com/make/"));
a("cafepress.com");
a("*.cafepress.com");
a("cafepress.co.uk");
a("*.cafepress.co.uk");
a("*.cpcache.com");
a("server.iad.liveperson.net");

R = new RuleSet("Caisse d'Epargne");
R.rules.push(new Rule("^http://(?:www\\.)?caisse-epargne\\.fr/", "https://www.caisse-epargne.fr/"));
a("www.caisse-epargne.fr");
a("caisse-epargne.com");

R = new RuleSet("California STD/HIV Prevention Training Center (partial)");
R.rules.push(new Rule("^((http://(?:www\\.)?)|https://)stdhivtraining\\.org/", "https://www.stdhivtraining.org/"));
a("stdhivtraining.org");
a("www.stdhivtraining.org");

R = new RuleSet("California State University (partial)");
R.rules.push(new Rule("^http://(?:www2?\\.)?csulb\\.edu/", "https://www.csulb.edu/"));
a("csulb.edu");
a("*.csulb.edu");

R = new RuleSet("Caltech");
R.rules.push(new Rule("^http://tqfr\\.caltech\\.edu/", "https://tqfr.caltech.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?access\\.caltech\\.edu/", "https://access.caltech.edu/"));
R.rules.push(new Rule("^http://(?:courses|moodle)\\.caltech\\.edu/", "https://courses.caltech.edu/"));
R.rules.push(new Rule("^http://irsecure\\.caltech\\.edu/", "https://irsecure.caltech.edu/"));
R.rules.push(new Rule("^http://mail\\.alumni\\.caltech\\.edu/", "https://mail.alumni.caltech.edu/"));
R.rules.push(new Rule("^http://utils\\.its\\.caltech\\.edu/", "https://utils.its.caltech.edu/"));
R.rules.push(new Rule("^http://webmail\\.caltech\\.edu/", "https://webmail.caltech.edu/"));
R.rules.push(new Rule("^http://webvpn\\.caltech\\.edu/", "https://webvpn.caltech.edu/"));
R.rules.push(new Rule("^http://techne1\\.caltech\\.edu/", "https://techne1.caltech.edu/"));
R.rules.push(new Rule("^http://business-query\\.caltech\\.edu:8181/", "https://business-query.caltech.edu:8181/"));
R.rules.push(new Rule("^http://nassau\\.caltech\\.edu:4444/", "https://nassau.caltech.edu:4444/"));
R.rules.push(new Rule("^http://pcard\\.caltech\\.edu/", "https://pcard.caltech.edu/"));
R.rules.push(new Rule("^http://scriptor\\.caltech\\.edu/", "https://scriptor.caltech.edu/"));
R.rules.push(new Rule("^http://courses\\.hss\\.caltech\\.edu/", "https://courses.hss.caltech.edu/"));
R.rules.push(new Rule("^http://dabney\\.caltech\\.edu/", "https://dabney.caltech.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?its\\.caltech\\.edu/", "https://www.its.caltech.edu/"));
R.rules.push(new Rule("^http://web\\.caltech\\.edu/", "https://web.caltech.edu/"));
a("tqfr.caltech.edu");
a("access.caltech.edu");
a("courses.caltech.edu");
a("irsecure.caltech.edu");
a("mail.alumni.caltech.edu");
a("utils.its.caltech.edu");
a("webmail.caltech.edu");
a("webvpn.caltech.edu");
a("techne1.caltech.edu");
a("business-query.caltech.edu");
a("nassau.caltech.edu");
a("pcard.caltech.edu");
a("scriptor.caltech.edu");
a("courses.hss.caltech.edu");
a("dabney.caltech.edu");
a("www.its.caltech.edu");
a("www.access.caltech.edu");
a("its.caltech.edu");
a("moodle.caltech.edu");
a("web.caltech.edu");

R = new RuleSet("Calum");
R.rules.push(new Rule("^http://(?:www\\.)?calum\\.org/", "https://calum.org/"));
a("calum.org");
a("www.calum.org");

R = new RuleSet("Calyx Institute");
R.rules.push(new Rule("^http://(?:www\\.)?calyxinstitute\\.org/", "https://www.calyxinstitute.org/"));
a("calyxinstitute.org");
a("*.calyxinstitute.org");

R = new RuleSet("Cam.ac.uk");
R.rules.push(new Rule("^http://www\\.cl\\.cam\\.ac\\.uk/", "https://www.cl.cam.ac.uk/"));
R.rules.push(new Rule("^http://www\\.admin\\.cam\\.ac\\.uk/", "https://www.admin.cam.ac.uk/"));
R.rules.push(new Rule("^http://webservices\\.admin\\.cam\\.ac\\.uk/", "https://webservices.admin.cam.ac.uk/"));
a("www.cl.cam.ac.uk");
a("www.admin.cam.ac.uk");
a("webservices.admin.cam.ac.uk");

R = new RuleSet("Cambey & West (partial)");
R.rules.push(new Rule("^http://(www\\.)?cambeywest\\.com/", "https://$1cambeywest.com/"));
a("cambeywest.com");
a("www.cambeywest.com");

R = new RuleSet("Cambridge Journals");
R.rules.push(new Rule("^http://journals\\.cambridge\\.org/", "https://journals.cambridge.org/"));
a("journals.cambridge.org");

R = new RuleSet("camelcamelcamel (partial)");
R.rules.push(new Rule("^http://s3\\.(antimac\\.org|camelcamelcamel\\.com)/", "https://s3.amazonaws.com/s3.$1/"));
a("s3.antimac.org");
a("s3.camelcamelcamel.com");

R = new RuleSet("Campact.de");
R.rules.push(new Rule("^http://(www\\.)?campact\\.de/", "https://www.campact.de/"));
a("www.campact.de");
a("campact.de");

R = new RuleSet("Campina (partial)");
R.rules.push(new Rule("^http://campinaopschool\\.nl/(error(%20pages/|page\\.htm$)|images/errorpage/)", "https://campinaopschool.nl/$1"));
R.rules.push(new Rule("^http://www\\.campinaopschool\\.nl/", "https://www.campinaopschool.nl/"));
R.rules.push(new Rule("^http://(www\\.)?connecthr\\.nl/", "https://www.connecthr.nl/"));
R.rules.push(new Rule("^http://intern\\.connecthr\\.nl/", "https://intern.connecthr.nl/"));
R.rules.push(new Rule("^http://(academy|m(elk|ilch)web)\\.frieslandcampina\\.com/", "https://$1.frieslandcampina.com/"));
R.rules.push(new Rule("^http://(www\\.)landliebe\\.de/", "https://landliebe.de/"));
R.rules.push(new Rule("^http://(www\\.)?melkweb\\.com/", "https://melkweb.frieslandcampina.com/"));
R.rules.push(new Rule("^http://edixml\\.m(elkweb|ycampina)\\.com/", "https://edixml.m$1.com/"));
R.rules.push(new Rule("^http://(www\\.)?mycampina\\.com/", "https://www.mycampina.com/"));
a("campinaopschool.nl");
a("www.campinaopschool.nl");
a("connecthr.nl");
a("intern.connecthr.nl");
a("www.connecthr.nl");
a("academy.frieslandcampina.com");
a("melkweb.frieslandcampina.com");
a("milchweb.frieslandcampina.com");
a("landliebe.de");
a("www.landliebe.de");
a("melkweb.com");
a("edixml.melkweb.com");
a("www.melkweb.com");
a("mycampina.com");
a("edixml.mycampina.com");
a("www.mycampina.com");

R = new RuleSet("Canada Post");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.canadapost\\.ca/", "https://$1.canadapost.ca/"));
a("canadapost.ca");
a("*.canadapost.ca");

R = new RuleSet("Canadian Lung Association");
R.rules.push(new Rule("^http://(?:www\\.)?lung\\.ca/", "https://www.lung.ca/"));
a("lung.ca");
a("www.lung.ca");

R = new RuleSet("CanalDigital");
R.rules.push(new Rule("^http://(?:www\\.)?canaldigital\\.no/", "https://www.canaldigital.no/"));
R.rules.push(new Rule("^http://(?:www\\.)?kabel\\.canaldigital\\.no/", "https://kabel.canaldigital.no/"));
R.rules.push(new Rule("^http://(?:www\\.)?parabol\\.canaldigital\\.no/", "https://parabol.canaldigital.no/"));
R.rules.push(new Rule("^http://(?:www\\.)?dealerno\\.canaldigital\\.no/", "https://www.dealerno.canaldigital.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?selger\\.canaldigital\\.no/", "https://selger.canaldigital.no/"));
R.rules.push(new Rule("^http://(?:www\\.)?canaldigital\\.se/", "https://www.canaldigital.se/"));
R.rules.push(new Rule("^http://(?:www\\.)?canaldigital\\.dk/", "https://www.canaldigital.dk/"));
R.rules.push(new Rule("^http://(?:www\\.)?canaldigital\\.fi/", "https://www.canaldigital.fi/"));
R.rules.push(new Rule("^http://(?:www\\.)?campaign\\.canaldigital\\.fi/", "https://campaign.canaldigital.fi/"));
a("www.canaldigital.no");
a("canaldigital.no");
a("kabel.canaldigital.no");
a("parabol.canaldigital.no");
a("www.dealerno.canaldigital.no");
a("selger.canaldigital.no");
a("www.canaldigital.se");
a("www.canaldigital.dk");
a("www.canaldigital.fi");
a("campaign.canaldigital.fi");

R = new RuleSet("Intl Cannagraphic Magazine");
R.rules.push(new Rule("^http://(?:www\\.)?icmag\\.com/", "https://www.icmag.com/"));
R.rules.push(new Rule("^https://icmag\\.com/", "https://www.icmag.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?icmag\\.com/ic/", "https://www.icmag.com/ic/"));
R.rules.push(new Rule("^https://icmag\\.com/ic/", "https://www.icmag.com/ic/"));
a("www.icmag.*");
a("icmag.*");

R = new RuleSet("Canonical (partial)");
R.rules.push(new Rule("^http://(www\\.)?blog\\.bazaar\\.canonical\\.com/", "https://blog.bazaar.canonical.com/"));
R.rules.push(new Rule("^http://shop\\.canonical\\.com/", "https://shop.canonical.com/"));
a("blog.bazaar.canonical.com");
a("www.blog.bazaar.canonical.com");
a("shop.canonical.com");

R = new RuleSet("Canv.as");
R.rules.push(new Rule("^http://(?:www\\.)?canv\\.as/", "https://www.canv.as/"));
a("canv.as");
a("www.canv.as");

R = new RuleSet("Capistrano");
R.rules.push(new Rule("^http://(?:www\\.)?capify\\.org/", "https://github.com/capistrano/capistrano/wiki/Documentation-v2.x"));
a("capify.org");
a("www.capify.org");

R = new RuleSet("Captura Group (partial)");
R.rules.push(new Rule("^http://cdn\\.measuredvoice\\.com/", "https://s3.amazonaws.com/cdn.measuredvoice.com/"));
R.rules.push(new Rule("^http://(www\\.)?measuredvoice\\.com/(favicon\\.ico|img/|wp-content/)", "https://$1measuredvoice.com/$2"));
a("measuredvoice.com");
a("www.measuredvoice.com");

R = new RuleSet("CareerBuilder (partial)");
R.rules.push(new Rule("^http://(www\\.)?careerbuilder\\.com/", "https://$1careerbuilder.com/"));
R.rules.push(new Rule("^http://(?:img|secure)\\.icbdr\\.com/", "https://secure.icbdr.com/"));
a("careerbuilder.com");
a("www.careerbuilder.com");
a("*.icbdr.com");

R = new RuleSet("CareerPerfect");
R.rules.push(new Rule("^http://(?:secure\\.|www\\.)?careerperfect\\.com/", "https://secure.careerperfect.com/"));
R.rules.push(new Rule("^http://monsterres\\.careerperfect\\.com/(brands|content/(\\d{4}\\w?|images|trk-v1))/", "https://secure.careerperfect.com/$1/"));
a("careerperfect.com");
a("*.careerperfect.com");

R = new RuleSet("Carnegie Mellon University (partial)");
R.rules.push(new Rule("^http://(www\\.)?cmu\\.edu/", "https://$1cmu.edu/"));
R.rules.push(new Rule("^http://(www\\.)?((directory\\.)?andrew|(calendar\\.)?cs)\\.cmu\\.edu/", "https://$1$2.cmu.edu/"));
a("cmu.edu");
a("*.cmu.edu");
a("directory.andrew.cmu.edu");
a("calendar.cs.cmu.edu");
a("*.calendar.cs.cmu.edu");
a("www.*.cmu.edu");

R = new RuleSet("CarterCenter.org");
R.rules.push(new Rule("^http://(www\\.)?cartercenter\\.org/", "https://cartercenter.org/"));
a("cartercenter.org");
a("www.cartercenter.org");

R = new RuleSet("Casale Media (partial)");
R.rules.push(new Rule("^http://system\\·casalemedia\\.com/", "https://system.casalemedia.com/"));
a("*.casalemedia.com");

R = new RuleSet("Cashback.co.uk (partial)");
R.rules.push(new Rule("^http://(secure\\.|www\\.)?cashback\\.co\\.uk/", "https://$1cashback.co.uk/"));
R.rules.push(new Rule("^https://secure\\.cashback\\.co\\.uk/$", "https://www.cashback.co.uk/"));
R.exclusions.push(new Exclusion("http://www\\.cashback\\.co\\.uk/$"));
a("cashback.co.uk");
a("*.cashback.co.uk");

R = new RuleSet("CasinoAffiliatePrograms.com");
R.rules.push(new Rule("^http://(www\\.)?casinoaffiliateprograms\\.com/", "https://casinoaffiliateprograms.com/"));
a("casinoaffiliateprograms.com");
a("www.casinoaffiliateprograms.com");

R = new RuleSet("Catalyst IT (partial)");
R.rules.push(new Rule("^http://wrms\\.catalyst\\.net\\.nz/", "https://wrms.catalyst.net.nz/"));
a("wrms.catalyst.net.nz");

R = new RuleSet("Cato Institute (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?cato\\.org/([^/]+/[^/]+/)", "https://www.cato.org/$1"));
R.rules.push(new Rule("^https://www\\.cato\\.org/([^/]+/?([^/]+/?)?)?$", "http://www.cato.org/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?cato\\.org/(images/|store/(sites/|user/(password|register)))", "https://www.cato.org/$1"));
R.rules.push(new Rule("^http://secure\\.cato\\.org/", "https://secure.cato.org/"));
a("cato.com");
a("*.cato.com");

R = new RuleSet("Causes (partial)");
R.rules.push(new Rule("^http://s2\\.causes\\.com/", "https://www.causes.com/"));
R.rules.push(new Rule("^http://([^s][\\w\\-]*\\.)?causes\\.com/", "https://$1causes.com/"));
R.rules.push(new Rule("^http://support\\.causes\\.com/(assets|generated|images|system)/", "https://causes.zendesk.com/$1/"));
R.rules.push(new Rule("^https?://causes\\.presscdn\\.com/", "https://exchange.causes.com/"));
a("causes.com");
a("*.causes.com");
a("causes.presscdn.com");

R = new RuleSet("Cbb.dk");
R.rules.push(new Rule("^http://(www\\.)?cbb\\.dk/", "https://www.cbb.dk/"));
a("cbb.dk");
a("www.cbb.dk");

R = new RuleSet("Cdon.se");
R.rules.push(new Rule("^http://cdon\\.se/", "https://cdon.se/"));
R.rules.push(new Rule("^http://www\\.cdon\\.se/", "https://cdon.se/"));
a("cdon.se");

R = new RuleSet("Celartem (partial)");
R.rules.push(new Rule("^http://(www\\.)?extensis\\.com(/common|.*/my_account)/", "https://www.extensis.com/$2/"));
R.rules.push(new Rule("^http://(www\\.)?lizardtech\\.com/", "https://lizardtech.com/"));
R.rules.push(new Rule("^http://fnt\\.webink\\.com/", "https://fnt.webink.com/"));
a("extensis.com");
a("www.extensis.com");
a("lizardtech.com");
a("www.lizardtech.com");
a("fnt.webink.com");

R = new RuleSet("Celiac Disease Foundation");
R.rules.push(new Rule("^http://(?:www\\.)?celiac\\.org/", "https://www.celiac.org/"));
a("celiac.org");
a("www.celiac.org");

R = new RuleSet("Cell");
R.rules.push(new Rule("^http://(www\\.)?cell\\.com/", "https://www.cell.com/"));
a("cell.com");
a("www.cell.com");

R = new RuleSet("Cengage (partial)");
R.rules.push(new Rule("^http://(www\\.)?calendarwiz\\.com/", "https://$1calendarwiz.com/"));
R.rules.push(new Rule("^http://serviceplus\\.cengage\\.com/", "https://serviceplus.cengage.com/"));
R.rules.push(new Rule("^http://assets\\.cengagebrain\\.com/", "https://assets.cengagebrain.com/"));
R.rules.push(new Rule("^http://(www\\.)?cengagebrain\\.co(m|\\.uk)/", "https://$1cengagebrain.co$2/"));
R.rules.push(new Rule("^http://(www\\.)?ed2go\\.com/", "https://$1ed2go.com/"));
R.rules.push(new Rule("^http://hbb\\.hbrstatic\\.com/", "https://business.highbeam.com/"));
R.rules.push(new Rule("^http://hbr\\.hbrstatic\\.com/", "https://highbeam.com/"));
R.rules.push(new Rule("^http://(www\\.)?highbeam\\.com/(Account/|combres\\.axd/|[cC]ontent/|favicon\\.ico|Img/|Login|Registration/)", "https://$1highbeam.com/$2"));
R.rules.push(new Rule("^http://business\\.highbeam\\.com/(Content/|favicon2\\.ico|iframead/)", "https://business.highbeam.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?multivu\\.com/", "https://www.multivu.com/"));
R.rules.push(new Rule("^http://(www\\.)?ordercourses\\.com/", "https://$1ordercourses.com/"));
a("calendarwiz.com");
a("*.calendarwiz.com");
a("serviceplus.cengage.com");
a("cengagebrain.com");
a("*.cengagebrain.com");
a("cengagebrain.co.uk");
a("*.cengagebrain.co.uk");
a("ed2go.com");
a("*.ed2go.com");
a("*.hbrstatic.com");
a("highbeam.com");
a("*.highbeam.com");
a("multivu.com");
a("www.multivu.com");
a("ordercourses.com");
a("www.ordercourses.com");

R = new RuleSet("Censorship.govt.nz");
R.rules.push(new Rule("^http://www\\.censorship\\.govt\\.nz/", "https://www.censorship.govt.nz/"));
R.rules.push(new Rule("^http://censorship\\.govt\\.nz/", "https://www.censorship.govt.nz/"));
a("censorship.govt.nz");
a("www.censorship.govt.nz");

R = new RuleSet("Center for American Progress (partial)");
R.rules.push(new Rule("^http://(www\\.)?thinkprogress\\.com/", "https://$1thinkprogress.com/"));
a("thinkprogress.org");
a("www.thinkprogress.org");

R = new RuleSet("Center for Responsive Politics (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?opensecrets\\.org/", "https://www.opensecrets.org/"));
R.rules.push(new Rule("^http://(asset|image)s\\.opensecrets\\.org/", "https://s3.amazonaws.com/$1s.opensecrets.org/"));
a("opensecrets.org");
a("*.opensecrets.org");

R = new RuleSet("Centos");
R.rules.push(new Rule("^http://(?:www\\.)?centos\\.org/", "https://www.centos.org/"));
a("centos.org");
a("*.centos.org");

R = new RuleSet("Chambal (partial)");
R.rules.push(new Rule("^http://(coppermine|images)\\.bucketexplorer\\.com/", "https://s3.amazonaws.com/$1.bucketexplorer.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?bucketexplorer\\.com/favicon\\.ico", "https://s3.amazonaws.com/images.bucketexplorer.com/favicon.ico"));
R.rules.push(new Rule("^http://accounts\\.chambal\\.com/", "https://accounts.chambal.com/"));
a("images.bucketexplorer.com");
a("accounts.chambal.com");

R = new RuleSet("Change.org");
R.rules.push(new Rule("^http://(?:www\\.)?change\\.org/", "https://www.change.org/"));
a("change.org");
a("www.change.org");

R = new RuleSet("Changemakers");
R.rules.push(new Rule("^http://(cdn\\.|www\\.)?changemakers\\.com/", "https://www.changemakers.com/"));
a("changemakers.com");
a("www.changemakers.com");

R = new RuleSet("Channel 5");
R.rules.push(new Rule("^http://oas\\.five\\.tv/", "https://oasc07.247realmedia.com/"));
R.rules.push(new Rule("^http://(www\\.)?channel5\\.com/(assets|images|stylesheets)/", "https://$1channel5.com/$2/"));
R.rules.push(new Rule("^http://fwd(?:cdn)?\\.channel5\\.com/", "https://fwd.channel5.com/"));
R.rules.push(new Rule("^http://sso\\.(?:channel5\\.com|five\\.tv)/", "https://sso.channel5.com/"));
R.rules.push(new Rule("^http://wwwcdn\\.channel5\\.com/", "https://wwwcdn.channel5.com/"));
a("channel5.com");
a("fwd.channel5.com");
a("fwdcdn.channel5.com");
a("sso.channel5.com");
a("www.channel5.com");
a("wwwcdn.channel5.com");
a("oas.five.tv");
a("sso.five.tv");

R = new RuleSet("Charity Navigator");
R.rules.push(new Rule("^http://(?:www\\.)?charitynavigator\\.org/", "https://www.charitynavigator.org/"));
a("charitynavigator.org");
a("www.charitynavigator.org");

R = new RuleSet("Charity Wings");
R.rules.push(new Rule("^http://(www\\.)?scrapbookroyalty\\.org/", "https://www.scrapbookroyalty.org/"));
a("scrapbookroyalty.org");
a("www.scrapbookroyalty.org");

R = new RuleSet("Charlotte Nature Museum");
R.rules.push(new Rule("^http://(?:www\\.)?charlottenaturemuseum\\.org/", "https://www.charlottenaturemuseum.org/"));
a("charlottenaturemuseum.org");
a("www.charlottenaturemuseum.org");

R = new RuleSet("Chartbeat (partial)");
R.rules.push(new Rule("^http://(www\\.)?chartbeat\\.com/", "https://$1chartbeat.com/"));
R.rules.push(new Rule("^http://static2\\.chartbeat\\.com/", "https://a248.e.akamai.net/chartbeat.download.akamai.com/102508/static2/"));
R.rules.push(new Rule("^http://support\\.chartbeat\\.com/(assets|generated|images|system)/", "https://assets.zendesk.com/$1/"));
a("chartbeat.com");
a("static2.chartbeat.com");
a("support.chartbeat.com");
a("www.chartbeat.com");

R = new RuleSet("Chase");
R.rules.push(new Rule("^http://chase\\.com/", "https://www.chase.com/"));
R.rules.push(new Rule("^http://(locator|www)\\.chase\\.com/", "https://$1.chase.com/"));
a("chase.com");
a("*.chase.com");

R = new RuleSet("CheapSSLs");
R.rules.push(new Rule("^http://(?:www\\.)?cheapssls\\.com/", "https://www.cheapssls.com/"));
a("www.cheapssls.com");
a("cheapssls.com");

R = new RuleSet("Check24.de");
R.rules.push(new Rule("^http://check24\\.de/", "https://check24.de/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.check24\\.de/", "https://$1.check24.de/"));
a("check24.de");
a("*.check24.de");

R = new RuleSet("Check Point");
R.rules.push(new Rule("^http://(?:www\\.)?checkpoint\\.com/", "https://www.checkpoint.com/"));
a("www.checkpoint.com");
a("checkpoint.com");

R = new RuleSet("ChillingEffects");
R.rules.push(new Rule("^http://(?:www\\.)?chillingeffects\\.org/", "https://www.chillingeffects.org/"));
a("www.chillingeffects.org");
a("chillingeffects.org");

R = new RuleSet("Chromium.org");
R.rules.push(new Rule("^http://src\\.chromium\\.org/", "https://src.chromium.org/"));
a("src.chromium.org");

R = new RuleSet("Chronicle");
R.rules.push(new Rule("^http://(?:www\\.)?chronicle\\.com/", "https://chronicle.com/"));
a("chronicle.com");
a("www.chronicle.com");

R = new RuleSet("CiteULike");
R.rules.push(new Rule("^http://(?:www\\.)?citeulike\\.org/login", "https://citeulike.org/login"));
a("www.citeulike.org");
a("citeulike.org");

R = new RuleSet("Citibank Australia");
R.rules.push(new Rule("^http://(www\\.)?citibank\\.com\\.au/", "https://$1citibank.com.au/"));
a("citibank.com.au");
a("www.citibank.com.au");

R = new RuleSet("CitizensInformation");
R.rules.push(new Rule("^http://(?:www\\.)?citizensinformation\\.ie/", "https://www.citizensinformation.ie/"));
a("www.citizensinformation.ie");
a("citizensinformation.ie");

R = new RuleSet("Citrix (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?citrix\\.com/", "https://www.citrix.com/"));
R.rules.push(new Rule("^http://eu\\.citrix\\.com/", "https://eu.citrix.com/"));
R.rules.push(new Rule("^http://(news|support)\\.citrixonline\\.com/", "https://$1.citrixonline.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?gotomeeting\\.com/(default|images)/", "https://www3.gotomeeting.com/$1/"));
R.rules.push(new Rule("^http://www([1-4])\\.gotomeeting\\.com/", "https://www$1.gomeeting.com/"));
R.rules.push(new Rule("^http://student\\.gototraining\\.com/", "https://student.gototraining.com/"));
a("citrix.com");
a("community.citrix.com");
a("eu.citrix.com");
a("www.citrix.com");
a("*.citrixonline.com");
a("gotomeeting.com");
a("*.gotomeeting.com");
a("*.gototraining.com");

R = new RuleSet("City Link");
R.rules.push(new Rule("^http://(www\\.)?city-link\\.co\\.uk/", "https://www.city-link.co.uk/"));
a("city-link.co.uk");
a("www.city-link.co.uk");

R = new RuleSet("City of Portland, OR");
R.rules.push(new Rule("^http://(?:www\\.)?portlandonline\\.com/", "https://www.portlandonline.com/"));
a("www.portlandonline.com");
a("portlandonline.com");

R = new RuleSet("Claranet (partial)");
R.rules.push(new Rule("^http://(corporate|customer|webmail(\\.bln\\.de)?|(nswebmail|portal)\\.uk)\\.clara\\.net/", "https://$1.clara.net/"));
R.rules.push(new Rule("^http://admin\\.clarahost\\.co\\.uk/", "https://admin.clarahost.co.uk/"));
R.rules.push(new Rule("^http://pop\\.claranet\\.de/", "https://pop.claranet.de/"));
R.rules.push(new Rule("^http://webmail\\.claranet\\.(nl|pt)/", "https://webmail.claranet.$1/"));
R.rules.push(new Rule("^http://servicecenter\\.claranet\\.nl/", "https://servicecenter.claranet.nl/"));
R.rules.push(new Rule("^http://secure\\.claranetsoho\\.co\\.uk/", "https://secure.claranetsoho.co.uk/"));
a("*.clara.net");
a("webmail.bln.de.clara.net");
a("nswebmail.uk.clara.net");
a("portal.uk.clara.net");
a("admin.clarahost.co.uk");
a("pop.claranet.de");
a("*.claranet.nl");
a("webmail.claranet.pt");
a("secure.claranetsoho.co.uk");

R = new RuleSet("Clasohlson.se");
R.rules.push(new Rule("^http://www\\.clasohlson\\.se/", "https://www.clasohlson.se/"));
R.rules.push(new Rule("^http://clasohlson\\.se/", "https://www.clasohlson.se/"));
a("clasohlson.se");
a("www.clasohlson.se");

R = new RuleSet("cleverbridge (partial)");
R.rules.push(new Rule("^http://(\\w+)\\.cleverbridge\\.(?:com|org)/", "https://$1.cleverbridge.com/"));
R.exclusions.push(new Exclusion("^http://(events|saas)\\."));
a("cleverbridge.com");
a("*.cleverbridge.com");
a("cleverbridge.org");
a("*.cleverbridge.org");

R = new RuleSet("ClickBank (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?clickbank\\.(?:com|net)/", "https://www.clickbank.com/"));
R.rules.push(new Rule("^http://ssl\\.clickbank\\.net/", "https://ssl.clickbank.net/"));
a("clickbank.com");
a("www.clickbank.com");
a("clickbank.net");
a("*.clickbank.net");

R = new RuleSet("CloudFlare");
R.rules.push(new Rule("^http://((ajax|cdnjs|support|www)\\.)?cloudflare\\.com/", "https://$1cloudflare.com/"));
a("cloudflare.com");
a("*.cloudflare.com");
a("*.www.cloudflare.com");

R = new RuleSet("CloudSwitch");
R.rules.push(new Rule("^http://(\\w+\\.)?cloudswitch\\.com/", "https://$1cloudswitch.com/"));
a("cloudswitch.com");
a("*.cloudswitch.com");

R = new RuleSet("Cloudfront");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.cloudfront\\.net/", "https://$1.cloudfront.net/"));
a("www.cloudfront.net");
a("*.cloudfront.net");

R = new RuleSet("Cloudmark");
R.rules.push(new Rule("^http://(www\\.)?cloudmark\\.com/", "https://cloudmark.com/"));
a("cloudmark.com");
a("www.cloudmark.com");

R = new RuleSet("Cloudsecurityalliance.org");
R.rules.push(new Rule("^http://(www\\.)?cloudsecurityalliance\\.org/", "https://cloudsecurityalliance.org/"));
a("cloudsecurityalliance.org");
a("www.cloudsecurityalliance.org");

R = new RuleSet("Cogen Media (partial)");
R.rules.push(new Rule("^http://degica\\.com/", "https://degica.com/"));
R.rules.push(new Rule("^http://dl\\.degica\\.com/", "https://dl.degica.com/"));
a("degica.com");
a("dl.degica.com");

R = new RuleSet("Coast Digital");
R.rules.push(new Rule("^http://(www\\.)?coastdigital\\.co\\.uk/", "https://coastdigital.co.uk/"));
a("coastdigital.co.uk");
a("www.coastdigital.co.uk");

R = new RuleSet("Coclico Project (partial)");
R.rules.push(new Rule("^http://forge\\.projet-coclico\\.org/", "https://forge.projet-coclico.org/"));
a("forge.projet-coclico.org");

R = new RuleSet("CodeWeavers (partial)");
R.rules.push(new Rule("^http://(www\\.)?codeweavers\\.com/(css|images|login)/", "https://www.codeweavers.com/$2/"));
a("codeweavers.com");
a("www.codeweavers.com");

R = new RuleSet("Codeplex");
R.rules.push(new Rule("^http://(?:www\\.)?codeplex\\.com/", "https://www.codeplex.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.codeplex\\.com/", "https://$1.codeplex.com/"));
R.exclusions.push(new Exclusion("^http://download\\.codeplex\\.com/"));
R.exclusions.push(new Exclusion("^http://i1\\.codeplex\\.com/"));
R.exclusions.push(new Exclusion("^http://i2\\.codeplex\\.com/"));
R.exclusions.push(new Exclusion("^http://i3\\.codeplex\\.com/"));
a("codeplex.com");
a("*.codeplex.com");

R = new RuleSet("Codesion (partial)");
R.rules.push(new Rule("^http://(app|help)\\.codesion\\.com/", "https://$1.codesion.com/"));
a("app.codesion.com");
a("help.codesion.com");

R = new RuleSet("codespeak");
R.rules.push(new Rule("^http://(www\\.)?codespeak\\.net/", "https://$1codespeak.net/"));
a("codespeak.net");
a("www.codespeak.net");

R = new RuleSet("CodingTeam");
R.rules.push(new Rule("^http://(www\\.)?codingteam\\.net/", "https://codingteam.net/"));
a("codingteam.net");
a("www.codingteam.net");

R = new RuleSet("Collabora (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?collabora\\.com/", "https://www.collabora.com/"));
a("collabora.com");
a("www.collabora.com");

R = new RuleSet("Collective Media (partial)");
R.rules.push(new Rule("^http://amp\\.collective\\.com/", "https://amp.collective.com/"));
R.rules.push(new Rule("^http://a\\.collective-media\\.net/", "https://a.collective-media.net/"));
a("amp.collective.com");
a("*.collective-media.net");

R = new RuleSet("College of Nurses of Ontario (partial)");
R.rules.push(new Rule("^http://(www\\.)?cno\\.org/(CNO|Global|login)/", "https://www.cno.org/$2/"));
R.rules.push(new Rule("^http://flo\\.cno\\.org/", "https://flo.cno.org/"));
a("cno.org");
a("flo.cno.org");
a("www.cno.org");

R = new RuleSet("CollegiateLink (partial)");
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.collegiatelink\\.net/", "https://$1.collegiatelink.net/"));
R.exclusions.push(new Exclusion("^http://((www[0-9]?)\\.)?collegiatelink\\.net/"));
a("*.collegiatelink.net");

R = new RuleSet("Colorado State Attorney General");
R.rules.push(new Rule("^http://(?:www\\.)?coloradoattorneygeneral\\.gov/", "https://www.coloradoattorneygeneral.gov/"));
a("coloradoattorneygeneral.gov");
a("www.coloradoattorneygeneral.gov");

R = new RuleSet("Official Colorado No-Call List");
R.rules.push(new Rule("^http://(?:www\\.)?coloradonocall\\.com/", "https://www.coloradonocall.com/"));
a("coloradonocall.com");
a("www.coloradonocall.com");

R = new RuleSet("Comcast (partial)");
R.rules.push(new Rule("^http://home\\.comcast\\.net/", "https://home.comcast.net/"));
R.rules.push(new Rule("^http://fandango\\.com/", "https://www.fandango.com/"));
R.rules.push(new Rule("^http://(content\\.|www\\.)?fandango\\.com/", "https://$1fandango.com/"));
R.rules.push(new Rule("^http://(?:images\\.fandango|(www\\.)?statf)\\.com/", "https://a248.e.akamai.net/f/248/9057/1d/content.fandango.com/"));
a("home.comcast.net");
a("fandango.com");
a("*.fandango.com");
a("statf.com");
a("www.statf.com");

R = new RuleSet("CommonDreams");
R.rules.push(new Rule("^http://(?:www\\.)?commondreams\\.org/", "https://www.commondreams.org/"));
a("commondreams.org");
a("www.commondreams.org");

R = new RuleSet("CommuniGate");
R.rules.push(new Rule("^http://(?:www\\.)?communigate\\.com/", "https://www.communigate.com/"));
a("communigate.com");
a("*.communigate.com");

R = new RuleSet("Comodo (partial)");
R.rules.push(new Rule("^http://((download|(?:www\\.)?downloads|enterprise|m|personalfirewall|(?:www\\.)?secure|ssl|support|www)\\.)?comodo\\.com/", "https://$1comodo.com/"));
R.rules.push(new Rule("^http://siteinspector\\.comodo\\.com/(favicon\\.ico|images/|login|stylesheets/)", "https://siteinspector.comodo.com/$1"));
R.exclusions.push(new Exclusion("^http://(antivirus|backup|system-utilities)\\."));
a("comodo.com");
a("www.downloads.comodo.com");
a("www.secure.comodo.com");
a("*.comodo.com");

R = new RuleSet("CompaniesHouse");
R.rules.push(new Rule("^http://(direct|ebilling|ewf)\\.companieshouse\\.gov\\.uk/", "https://$1.companieshouse.gov.uk/"));
a("*.companieshouse.gov.uk");

R = new RuleSet("CompaniesInTheUK");
R.rules.push(new Rule("^http://companiesintheuk\\.co\\.uk/", "https://companiesintheuk.co.uk/"));
R.rules.push(new Rule("^http://(www)\\.companiesintheuk\\.co\\.uk/", "https://$1.companiesintheuk.co.uk/"));
a("companiesintheuk.co.uk");
a("www.companiesintheuk.co.uk");

R = new RuleSet("CompareTheMarket");
R.rules.push(new Rule("^http://(?:www\\.)?comparethemarket\\.com/", "https://www.comparethemarket.com/"));
a("comparethemarket.com");
a("www.comparethemarket.com");

R = new RuleSet("Comparis.ch");
R.rules.push(new Rule("^http://(?:www\\.)?comparis\\.ch/", "https://www.comparis.ch/"));
a("comparis.ch");
a("www.comparis.ch");

R = new RuleSet("ComputerWorld (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?computerworld\\.com/", "https://www.computerworld.com/"));
a("computerworld.com");
a("www.computerworld.com");

R = new RuleSet("Comviq.se");
R.rules.push(new Rule("^http://comviq\\.se/", "https://comviq.se/"));
R.rules.push(new Rule("^http://www\\.comviq\\.se/", "https://www.comviq.se/"));
a("comviq.se");
a("www.comviq.se");

R = new RuleSet("Condé Nast (partial)");
R.rules.push(new Rule("^http://static\\.arstechnica\\.net/", "https://arstechnica.cachefly.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?condenaststore\\.com/", "https://www.condenaststore.com/"));
R.rules.push(new Rule("^http://subscribe\\.condenet\\.com/", "https://subscribe.condenet.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?(details|golfdigest|newyorker|wired)\\.com/((cs|image)s/|favicon\\.ico$|sandbox/)", "https://secure.$1.com/$2"));
R.rules.push(new Rule("^http://secure\\.(details|golfdigest|newyorker|wired)\\.com/", "https://secure.$1.com/"));
R.rules.push(new Rule("^http://(www\\.)?golfdigestinsiders\\.com/", "https://$1golfdigestinsiders.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?gq-magazine\\.co\\.uk/_/", "https://d3u12z27ui3vom.cloudfront.net/GQ/343431a42aff/"));
R.rules.push(new Rule("^http://(?:www\\.)?wired\\.com/usr/log(in|out)", "https://secure.wired.com/usr/log$1"));
R.rules.push(new Rule("^http://subscri(be|ptions)\\.wired\\.com/", "https://subscri$1.wired.com/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?wired\\.com/favicon\\.ico$"));
a("static.arstechnica.net");
a("condenaststore.com");
a("www.condenaststore.com");
a("subscribe.condenet.com");
a("details.com");
a("*.details.com");
a("golfdigest.com");
a("*.golfdigest.com");
a("golfdigestinsiders.com");
a("www.golfdigestinsiders.com");
a("newyorker.com");
a("*.newyorker.com");
a("gq-magazine.co.uk");
a("www.gq-magazine.co.uk");
a("wired.com");
a("*.wired.com");

R = new RuleSet("Condesa (partial)");
R.rules.push(new Rule("^http://secure\\.prleap\\.com/", "https://secure.prleap.com/"));
a("secure.prleap.com");

R = new RuleSet("Connect.me");
R.rules.push(new Rule("^http://(www\\.)?connect\\.me/", "https://connect.me/"));
a("connect.me");
a("www.connect.me");

R = new RuleSet("Constant Contact (partial)");
R.rules.push(new Rule("^http://constantcontact\\.com/", "https://constantcontact.com/"));
R.rules.push(new Rule("^http://(?:developer|www)\\.constantcontact\\.com/(favicon\\.ico|features/signup\\·jsp|(global-(login|nav)|login|styles)\\.jsp|_styles/|)", "https://www.constantcontact.com/$1"));
R.rules.push(new Rule("^http://community\\.constantcontact\\.com/", "https://community.constantcontact.com/"));
R.rules.push(new Rule("^http://img(?:\\.f2|ssl)?\\.constantcontact\\.com/", "https://imgssl.constantcontact.com/"));
a("constantcontact.com");
a("*.constantcontact.com");

R = new RuleSet("ConsumerAffairs.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?consumeraffairs\\.com/", "https://$1consumeraffairs.com/"));
a("consumeraffairs.com");
a("www.consumeraffairs.com");

R = new RuleSet("Consumer Reports");
R.rules.push(new Rule("^http://(www\\.)?consumerreports\\.org/", "https://www.consumerreports.org/"));
a("www.consumerreports.org");
a("consumerreports.org");

R = new RuleSet("Continent 8 Technologies (partial)");
R.rules.push(new Rule("^http://ecess1\\.cdn\\.continent8\\.com/", "https://ecess1.cdn.continent8.com/"));
a("ecess1.cdn.continent8.com");

R = new RuleSet("Continental");
R.rules.push(new Rule("^http://(?:www\\.)?continental\\.com/", "https://www.continental.com/"));
R.rules.push(new Rule("^http://www\\.covacations\\.com/", "https://www.covacations.com/"));
R.rules.push(new Rule("^http://covacations\\.com/", "https://www.covacations.com/"));
R.rules.push(new Rule("^http://checkin\\.continental\\.com/", "https://checkin.continental.com/"));
a("www.continental.com");
a("continental.com");
a("www.covacations.com");
a("covacations.com");
a("checkin.continental.com");

R = new RuleSet("CONVAR (partial)");
R.rules.push(new Rule("^http://(www\\.)?convar\\.de/([\\w\\W]+)", "https://$1convar.com/$2?language=2"));
R.rules.push(new Rule("^http://(shop\\.|www\\.)?convar\\.com/", "https://$1convar.com/"));
R.rules.push(new Rule("^http://(www\\.)?datenretter\\.de/", "https://$1datenretter.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?tuv\\.com/media/", "https://www.tuv.com/media/"));
R.rules.push(new Rule("^http://(?:www\\.)?tuvdotcom\\.com/", "https://www.tuvdotcom.com/"));
R.exclusions.push(new Exclusion("^http://(jas|repairservice|sam)\\.convar\\.com/"));
a("convar.com");
a("*.convar.com");
a("convar.de");
a("*.convar.de");
a("datenretter.de");
a("*.datenretter.de");
a("tuv.com");
a("www.tuv.com");
a("tuvdotcom.com");
a("www.tuvdotcom.com");

R = new RuleSet("Convio");
R.rules.push(new Rule("^http://customer\\.convio\\.net/$", "https://secure2.convio.net/customer/site/SPageServer"));
R.rules.push(new Rule("^http://secure[23]\\.convio\\.net/", "https://secure$1.convio.net/"));
a("customer.convio.net");
a("secure2.convio.net");
a("secure3.convio.net");

R = new RuleSet("Coochey.net");
R.rules.push(new Rule("^http://(www\\.)?coochey\\.net/", "https://www.coochey.net/"));
a("coochey.net");
a("www.coochey.net");

R = new RuleSet("Coop.ch");
R.rules.push(new Rule("^http://(?:www\\.)?coop\\.ch/", "https://www.coop.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?bankcoop\\.ch/", "https://www.bankcoop.ch/"));
R.rules.push(new Rule("^http://onlinebanking\\.bankcoop\\.ch/", "https://onlinebanking.bankcoop.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?supercard\\.ch/", "https://www.supercard.ch/"));
a("coop.ch");
a("www.coop.ch");
a("bankcoop.ch");
a("www.bankcoop.ch");
a("onlinebanking.bankcoop.ch");
a("supercard.ch");
a("www.supercard.ch");

R = new RuleSet("Coop.no");
R.rules.push(new Rule("^http://(www\\.)?coop\\.no/", "https://coop.no/"));
R.rules.push(new Rule("^http://(www\\.)?coophotellkupp\\.com/", "https://www.coophotellkupp.com/"));
a("www.coop.no");
a("coop.no");
a("www.coophotellkupp.com");
a("coophotellkupp.no");

R = new RuleSet("CoreMetrics (partial)");
R.rules.push(new Rule("^http://stats\\.surfaid\\.ihost\\.com/", "https://stats.surfaid.ihost.com/"));
a("*.surfaid.ihost.com");

R = new RuleSet("Cornell University (partial)");
R.rules.push(new Rule("^http://www\\.arxiv\\.org/", "https://arxiv.org/"));
R.rules.push(new Rule("^http://arxiv\\.org/(css/|favicon\\.ico)", "https://arxiv.org/$1"));
R.rules.push(new Rule("^http://arxiv\\.org/icons/", "https://s3.amazonaws.com/arxiv-web-static1/icons/"));
R.rules.push(new Rule("^http://static\\.arxiv\\.org/", "https://s3.amazonaws.com/arxiv-web-static1/"));
R.rules.push(new Rule("^http://(topeka\\.ccmr\\.|(www\\.)?(cs|library)\\.|www\\.)?cornell\\.edu/", "https://$1cornell.edu/"));
a("arxiv.org");
a("static.arxiv.org");
a("www.arxiv.org");
a("cornell.edu");
a("*.cornell.edu");
a("www.cs.cornell.edu");
a("www.library.cornell.edu");
a("topeka.ccmr.cornell.edu");

R = new RuleSet("Corning Credit Union");
R.rules.push(new Rule("^http://(www\\.)?corningcu\\.org/", "https://corningcu.org/"));
a("www.corningcu.org");
a("corningcu.org");

R = new RuleSet("Costco");
R.rules.push(new Rule("^http://(shop\\.|www\\.)?costco\\.com/", "https://$1costco.com/"));
R.rules.push(new Rule("^http://content\\.costco\\.com/", "https://www.costco.com/"));
a("costco.com");
a("*.costco.com");

R = new RuleSet("Cotse.net");
R.rules.push(new Rule("^http://(www\\.)?cotse\\.net/", "https://www.cotse.net/"));
a("www.cotse.net");
a("cotse.net");

R = new RuleSet("Couchsurfing");
R.rules.push(new Rule("^http://www\\.couchsurfing\\.org/login\\.html$", "https://www.couchsurfing.org/login.html"));
a("www.couchsurfing.org");
a("couchsurfing.org");

R = new RuleSet("Countquest.se");
R.rules.push(new Rule("^http://sdc\\.countquest\\.se/", "https://sdc.countquest.se/"));
a("sdc.countquest.se");

R = new RuleSet("Coupons, Inc (partial)");
R.rules.push(new Rule("^http://coupouns\\.com/", "https://www.coupouns.com/"));
R.rules.push(new Rule("^http://www\\.coupons\\.com/couponweb/", "https://www.coupons.com/couponweb/"));
R.rules.push(new Rule("^http://(access|brandcaster|downloads1|insight)\\.coupons\\.com/", "https://$1.coupons.com/"));
R.rules.push(new Rule("^http://cdn\\.cpnscdn\\.com/", "https://cdn.cpnscdn.com/"));
a("coupons.com");
a("*.coupons.com");
a("cdn.cpnscdn.com");

R = new RuleSet("Courage Campaign");
R.rules.push(new Rule("^http://(?:www\\.|secure\\.)?couragecampaign\\.org/", "https://secure.couragecampaign.org/"));
a("couragecampaign.org");
a("www.couragecampaign.org");
a("secure.couragecampaign.org");

R = new RuleSet("Coursera");
R.rules.push(new Rule("^http://coursera\\.org/", "https://www.coursera.org/"));
R.rules.push(new Rule("^http://(class|www)\\.coursera\\.org/", "https://$1.coursera.org/"));
a("coursera.org");
a("*.coursera.org");

R = new RuleSet("Foundation for Health Coverage Education");
R.rules.push(new Rule("^http://(?:www\\.)?coverageforall\\.org/", "https://www.coverageforall.org/"));
a("coverageforall.org");
a("www.coverageforall.org");

R = new RuleSet("coxnewsweb.net");
R.rules.push(new Rule("^http://img\\.coxnewsweb\\.com/", "https://img.coxnewsweb.com/"));
R.rules.push(new Rule("^http://alt\\.coxnewsweb\\.com/", "https://alt.coxnewsweb.com/"));
a("coxnewsweb.com");
a("img.coxnewsweb.com");
a("alt.coxnewsweb.com");

R = new RuleSet("Crain Communications (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?adage\\.com/(help/|(login|register)\\.php)", "https://adage.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?adage\\.com/(image|script)s/", "https://gaia.adage.com/$1s/"));
R.rules.push(new Rule("^http://((www\\.)?amig|gai)a\\.adage\\.com/", "https://$1a.adage.com/"));
R.rules.push(new Rule("^http://sec\\.crain\\.com/", "https://sec.crain.com/"));
R.rules.push(new Rule("^http://(www\\.)?creativity-online\\.com/", "https://creativity-online.com/"));
a("adage.com");
a("amiga.adage.com");
a("www.amiga.adage.com");
a("gaia.adage.com");
a("www.adage.com");
a("sec.crain.com");
a("creativity-online.com");
a("www.creativity-online.com");

R = new RuleSet("CreateSpace");
R.rules.push(new Rule("^http://(www\\.)?createspace\\.com/", "https://www.createspace.com/"));
a("createspace.com");
a("www.createspace.com");

R = new RuleSet("Creative Commons");
R.rules.push(new Rule("^http://(i|api)\\.creativecommons\\.org/", "https://$1.creativecommons.org/"));
R.rules.push(new Rule("^http://creativecommons\\.org/", "https://creativecommons.org/"));
R.rules.push(new Rule("^http://creativecommons\\.net/", "https://creativecommons.net/"));
a("i.creativecommons.org");
a("api.creativecommons.org");
a("creativecommons.org");
a("creativecommons.net");

R = new RuleSet("Critical Path Internet Services");
R.rules.push(new Rule("^http://secure\\.critpath\\.org/", "https://secure.critpath.org/"));
a("secure.critpath.org");

R = new RuleSet("Crockotec (partial)");
R.rules.push(new Rule("^http://(www\\.)?crocko\\.com/", "https://$1crocko.com/"));
R.rules.push(new Rule("^http://(www\\.)?easy-share\\.com/", "https://$1easy-share.com/"));
a("crocko.com");
a("*.crocko.com");
a("easy-share.com");
a("www.easy-share.com");

R = new RuleSet("Crucial.com (partial)");
R.rules.push(new Rule("^http://www\\.crucial\\.com/(images\\d{0,2}|js|css|reviews)/", "https://www.crucial.com/$1/"));
R.rules.push(new Rule("^http://www\\.crucial\\.com/favicon.png", "https://www.crucial.com/favicon.png"));
a("*.crucial.com");

R = new RuleSet("Cryptanalysis");
R.rules.push(new Rule("^http://(www\\.)?cryptanalysis\\.eu/", "https://$1cryptanalysis.eu/"));
a("cryptanalysis.eu");
a("www.cryptanalysis.eu");

R = new RuleSet("Crypto.cat");
R.rules.push(new Rule("^http://crypto\\.cat/", "https://crypto.cat/"));
a("crypto.cat");

R = new RuleSet("Crypto.is");
R.rules.push(new Rule("^http://(?:www\\.)?crypto\\.is/", "https://www.crypto.is/"));
R.rules.push(new Rule("^http://wiki\\.crypto\\.is/", "https://wiki.crypto.is/"));
R.rules.push(new Rule("^http://blog\\.crypto\\.is/", "https://blog.crypto.is/"));
a("crypto.is");
a("www.crypto.is");
a("wiki.crypto.is");
a("blog.crypto.is");

R = new RuleSet("cryptomilk.org (partial)");
R.rules.push(new Rule("^http://(blog|milliways)\\.cryptomilk\\.org/", "https://$1.cryptomilk.org/"));
a("*.cryptomilk.org");

R = new RuleSet("Cs.arizona.edu");
R.rules.push(new Rule("^http://www\\.cs\\.arizona\\.edu/", "https://www.cs.arizona.edu/"));
R.rules.push(new Rule("^http://cs\\.arizona\\.edu/", "https://www.cs.arizona.edu/"));
a("cs.arizona.edu");
a("www.cs.arizona.edu");

R = new RuleSet("Ctt");
R.rules.push(new Rule("^http://(?:www\\.)?ctt\\.pt/", "https://www.ctt.pt/"));
a("www.ctt.pt");
a("ctt.pt");

R = new RuleSet("Cultura Sparebank");
R.rules.push(new Rule("^http://cultura\\.no/", "https://cultura.no/"));
R.rules.push(new Rule("^http://www\\.cultura\\.no/", "https://www.cultura.no/"));
a("cultura.no");
a("www.cultura.no");

R = new RuleSet("Cupid (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?be(coquin|naughty)\\.com/", "https://www.be$1.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?cupid\\.com/(aff|oth)\\.php", "https://www.cupid.com/$1.php"));
R.rules.push(new Rule("^http://(stat\\.ed|whitelabeldating)\\.cupidplc\\.com/", "https://$1.cupidplc.com/"));
a("becoquin.com");
a("www.becoquin.com");
a("benaughty.com");
a("www.benaughty.com");
a("cupid.com");
a("www.cupid.com");
a("stat.ed.cupidplc.com");
a("whitelabeldating.cupidplc.com");

R = new RuleSet("Curvehost");
R.rules.push(new Rule("^http://(www\\.)?curvehost\\.com/", "https://curvehost.com/"));
a("curvehost.com");
a("www.curvehost.com");

R = new RuleSet("Customer Lobby (partial)");
R.rules.push(new Rule("^http://(www\\.)?customerlobby\\.com/", "https://$1customerlobby.com/"));
a("customerlobby.com");
a("*.customerlobby.com");

R = new RuleSet("cve.mitre.org");
R.rules.push(new Rule("^http://cve\\.mitre\\.org/", "https://cve.mitre.org/"));
a("cve.mitre.org");

R = new RuleSet("Cyando (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?u(?:l|ploaded)\\.to/(favicon\\.ico$|img/|js2?/|misc/)", "https://uploaded.to/$1"));
a("uploaded.to");
a("www.uploaded.to");
a("ul.to");
a("www.ul.to");

R = new RuleSet("CyberGhost");
R.rules.push(new Rule("^http://(\\w+\\.)?cyberghostvpn\\.com/", "https://$1cyberghostvpn.com/"));
a("cyberghostvpn.com");
a("*.cyberghostvpn.com");

R = new RuleSet("Cykloteket.se");
R.rules.push(new Rule("^http://www\\.cykloteket\\.se/", "https://cykloteket.se/"));
R.rules.push(new Rule("^http://cykloteket\\.se/", "https://cykloteket.se/"));
a("www.cykloteket.se");
a("cykloteket.se");

R = new RuleSet("DAB Bank");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.dab-bank\\.de/", "https://$1.dab-bank.de/"));
a("*.dab-bank.de");

R = new RuleSet("DALnet");
R.rules.push(new Rule("^http://(?:www\\.)?dal\\.net/", "https://www.dal.net/"));
R.rules.push(new Rule("^http://(inspiration|users)\\.dal\\.net/", "https://$1.dal.net/"));
a("dal.net");
a("www.dal.net");
a("inspiration.dal.net");
a("users.dal.net");

R = new RuleSet("DHL.de");
R.rules.push(new Rule("^http://(?:www\\.)?dhl\\.de/", "https://www.dhl.de/"));
R.rules.push(new Rule("^http://dhl\\.de/", "https://www.dhl.de/"));
a("dhl.de");
a("*.dhl.de");

R = new RuleSet("Deutsche Kreditbank");
R.rules.push(new Rule("^http://dkb\\.de/", "https://dkb.de/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.dkb\\.de/", "https://$1.dkb.de/"));
a("dkb.de");
a("*.dkb.de");

R = new RuleSet("DMU");
R.rules.push(new Rule("^http://dmu\\.ac\\.uk/", "https://dmu.ac.uk/"));
R.rules.push(new Rule("^http://(www|www\\.library|chooseyourhallroom|idpedir|password|vle|webmail)\\.dmu\\.ac\\.uk/", "https://$1.dmu.ac.uk/"));
a("dmu.ac.uk");
a("www.dmu.ac.uk");
a("www.library.dmu.ac.uk");
a("chooseyourhallroom.dmu.ac.uk");
a("idpedir.dmu.ac.uk");
a("password.dmu.ac.uk");
a("vle.dmu.ac.uk");
a("webmail.dmu.ac.uk");

R = new RuleSet("DR.com.tr");
R.rules.push(new Rule("^http://(www\\.)?dr\\.com\\.tr/", "https://www.dr.com.tr/"));
a("www.dr.com.tr");
a("dr.com.tr");

R = new RuleSet("DTunnel");
R.rules.push(new Rule("^http://(?:www\\.)?dtunnel\\.com/", "https://dtunnel.com/"));
a("dtunnel.com");
a("www.dtunnel.com");

R = new RuleSet("Daily Star (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?dailystar\\.co\\.uk/", "https://www.dailystar.co.uk/"));
R.rules.push(new Rule("^http://(?:cdn\\.)?images\\.dailystar-uk\\.co\\.uk/", "https://s3.amazonaws.com/images.dailystar-uk.co.uk/"));
a("dailystar.co.uk");
a("www.dailystar.co.uk");
a("images.dailystar-uk.co.uk");
a("cdn.images.dailystar-uk.co.uk");

R = new RuleSet("Daily");
R.rules.push(new Rule("^http://(?:www\\.)?daily\\.co\\.uk/", "https://www.daily.co.uk/"));
R.rules.push(new Rule("^http://(webmail)\\.daily\\.co\\.uk/", "https://$1.daily.co.uk/"));
a("www.daily.co.uk");
a("webmail.daily.co.uk");
a("daily.co.uk");

R = new RuleSet("dakko.us (partial)");
R.rules.push(new Rule("^http://(www-s\\.)?dakko\\.us/", "https://$1dakko.us/"));
R.rules.push(new Rule("^https?://www\\.dakko\\.us/", "https://www-s.dakko.us/"));
a("dakko.us");
a("www.dakko.us");
a("www-s.dakko.us");

R = new RuleSet("Das-labor.org");
R.rules.push(new Rule("^http://(www\\.)?das-labor\\.org/", "https://www.das-labor.org/"));
a("das-labor.org");
a("www.das-labor.org");

R = new RuleSet("Data Design (partial)");
R.rules.push(new Rule("^http://secure\\.webmercs\\.com/", "https://secure.webmercs.com/"));
a("secure.webmercs.com");

R = new RuleSet("data.fm");
R.rules.push(new Rule("^http://data\\.fm/", "https://data.fm/"));
R.rules.push(new Rule("^http://([\\w\\-_]+)\\.data\\.fm/", "https://$1.data.fm/"));
a("data.fm");
a("*.data.fm");

R = new RuleSet("DataCenterKnowledge.com");
R.rules.push(new Rule("^http://(www\\.)?datacenterknowledge\\.com/", "https://$1datacenterknowledge.com/"));
R.rules.push(new Rule("^http://jobs\\.datacenterknowledge\\.com/c/", "https://datacenterknowledge.jobamatic.com/c/"));
R.exclusions.push(new Exclusion("^http://jobs\\.datacenterknowledge\\.com/($|a/)"));
a("datacenterknowledge.com");
a("jobs.datacenterknowledge.com");
a("www.datacenterknowledge.com");

R = new RuleSet("DataVantage");
R.rules.push(new Rule("^http://(www\\.)?datavantage\\.com/", "https://$1datavantage.com/"));
a("datavantage.com");
a("www.datavantage.com");

R = new RuleSet("Datamonitor (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?research-store\\.com/(([\\w\\-]+/)?(css/|images/|Library/|Purchase/Basket\\.aspx|Registration\\.aspx|skins/))", "https://www.research-store.com/$1"));
a("researchstore.com");
a("www.researchstore.com");

R = new RuleSet("Datapipe.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?(my)?datapipe\\.(com|net)/", "https://www.$2datapipe.com/"));
R.rules.push(new Rule("^http://www\\.datapipe\\.co\\.uk/", "https://www.datapipe.co.uk/"));
R.rules.push(new Rule("^http://secure\\.datapipe\\.com/", "https://secure.datapipe.com/"));
a("datapipe.com");
a("secure.datapipe.com");
a("www.datapipe.com");
a("datapipe.co.uk");
a("www.datapipe.co.uk");
a("datapipe.net");
a("www.datapipe.net");
a("mydatapipe.com");
a("www.mydatapipe.com");
a("mydatapipe.net");
a("www.mydatapipe.net");

R = new RuleSet("Datatilsynet");
R.rules.push(new Rule("^http://(?:www\\.)?datatilsynet\\.no/", "https://www.datatilsynet.no/"));
R.rules.push(new Rule("^http://(?:www\\.)?slettmeg\\.no/", "https://slettmeg.no/"));
a("www.datatilsynet.no");
a("datatilsynet.no");
a("www.slettmeg.no");
a("slettmeg.no");

R = new RuleSet("Deaconess Health System");
R.rules.push(new Rule("^(http://(www\\.)?|https://)deaconess\\.com/", "https://www.deaconess.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?deaconess\\.com/mobile(/|$)"));
a("deaconess.com");
a("www.deaconess.com");

R = new RuleSet("DealCent");
R.rules.push(new Rule("^http://(www\\.)?dealcent\\.com/", "https://$1dealcent.com/"));
a("dealcent.com");
a("www.dealcent.com");

R = new RuleSet("Deal Extreme");
R.rules.push(new Rule("^http://(?:www\\.)?dealextreme\\.com/", "https://www.dealextreme.com/"));
R.rules.push(new Rule("^http://club\\.dealextreme\\.com/", "https://club.dealextreme.com/"));
R.rules.push(new Rule("^http://(www\\.)?dx\\.com/", "https://www.dx.com/"));
R.rules.push(new Rule("^http://(club|s)\\.dx\\.com/", "https://$1.dx.com/"));
R.rules.push(new Rule("^http://e\\.dealextreme\\.com/", "https://e.dealextreme.com/"));
R.rules.push(new Rule("^http://img\\.dxcdn\\.com/", "https://img.dxcdn.com/"));
a("www.dealextreme.com");
a("dealextreme.com");
a("club.dealextreme.com");
a("dx.com");
a("www.dx.com");
a("club.dx.com");
a("s.dx.com");
a("e.dealextreme.com");
a("img.dxcdn.com");

R = new RuleSet("Dealer.com (mismatches)");
R.rules.push(new Rule("^http://(?:www\\.)?dealer\\.com/", "https://www.dealer.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?gatorchrysler\\.net/", "https://www.gatorchrysler.net/"));
a("dealer.com");
a("gatorchrysler.net");
a("*.dealer.com");
a("*.www.dealer.com");
a("www.gatorchrysler.net");

R = new RuleSet("Dealer.com (partial)");
R.rules.push(new Rule("^http://cdn\\.dealer\\.com/", "https://pictures.dealer.com/"));
R.rules.push(new Rule("^http://(hits|pictures|static)\\.dealer\\.com/", "https://$1.dealer.com/"));
a("cdn.dealer.com");
a("hits.dealer.com");
a("pictures.dealer.com");
a("static.dealer.com");

R = new RuleSet("Debuggable (partial)");
R.rules.push(new Rule("^http://www(-eleni|-eric)?\\.transloadit\\.com/", "https://www$1.transloadit.com/"));
R.rules.push(new Rule("^http://transloadit\\.com/(accounts/forgot_pw|img/|login|mediaelement/|signup)", "https://transloadit.com/$1"));
a("transloadit.com");
a("*.transloadit.com");

R = new RuleSet("Decdna.net");
R.rules.push(new Rule("^http://(na|(eu\\.link))\\.decdna\\.net/", "https://$1.decdna.net/"));
a("na.decdna.net");
a("eu.link.decdna.net");

R = new RuleSet("Deco.proteste.pt");
R.rules.push(new Rule("^http://(?:www\\.)?deco\\.proteste\\.pt/", "https://www.deco.proteste.pt/"));
a("deco.proteste.pt");
a("www.deco.proteste.pt");

R = new RuleSet("Deepbit.net");
R.rules.push(new Rule("^http://(?:www\\.)?deepbit\\.net/", "https://deepbit.net/"));
a("deepbit.net");
a("www.deepbit.net");

R = new RuleSet("Defcon");
R.rules.push(new Rule("^http://(?:www\\.)?defcon\\.org/", "https://www.defcon.org/"));
a("www.defcon.org");
a("defcon.org");

R = new RuleSet("Delicious");
R.rules.push(new Rule("^http://(www\\.)?delicious\\.com/", "https://$1delicious.com/"));
R.rules.push(new Rule("^http://(?:www\\.|del\\.)?icio\\.us/", "https://delicious.com/"));
a("delicious.com");
a("www.delicious.com");
a("icio.us");
a("del.icio.us");
a("www.icio.us");

R = new RuleSet("Delico.se");
R.rules.push(new Rule("^http://www\\.delico\\.se/", "https://www.delico.se/"));
R.rules.push(new Rule("^http://delico\\.se/", "https://delico.se/"));
a("www.delico.se");
a("delico.se");

R = new RuleSet("Dell");
R.rules.push(new Rule("^http://(www\\.)?dell\\.com/", "https://www.dell.com/"));
R.rules.push(new Rule("^http://(linux|support)\\.dell\\.com/", "https://$1.dell.com/"));
a("dell.com");
a("linux.dell.com");
a("www.dell.com");
a("support.dell.com");

R = new RuleSet("Delta.no");
R.rules.push(new Rule("^http://(www\\.)?delta\\.no/", "https://www.delta.no/"));
a("www.delta.no");
a("delta.no");

R = new RuleSet("Demand Base");
R.rules.push(new Rule("^http://demandbase\\.com/", "https://www.demandbase.com/"));
R.rules.push(new Rule("^http://(leads\\.|www\\.)?demandbase\\.com/", "https://$1demandbase.com/"));
a("demandbase.com");
a("*.demandbase.com");

R = new RuleSet("Demand Media (partial)");
R.rules.push(new Rule("^http://vs\\.demandmedia\\.com/", "https://vs.demandmedia.com/"));
R.rules.push(new Rule("^http://(?:(cdn-)?www\\.)?demandstudios\\.com/", "https://www.demandstudios.com/"));
R.rules.push(new Rule("^http://(extended|vs)\\.dmtracker\\.com/", "https://$1.dmtracker.com/"));
R.rules.push(new Rule("^http://(?:(cdn-www)?golflink\\.com|(www\\.)?golflink\\.net|u?i\\.glimg\\.net)/", "https://www.golflink.com/"));
R.rules.push(new Rule("^http://(?:(cdn-)?www\\.)?greencar\\.com/", "https://www.greencar.com/"));
R.rules.push(new Rule("^http://(?:livestrong\\.com|i\\.lsimg\\.net)/", "https://www.livestrong.com/"));
R.rules.push(new Rule("^http://www\\.livestrong\\.com/(login|re(mind|gister))/", "https://www.livestrong.com/$1/"));
a("vs.demandmedia.com");
a("demandstudios.com");
a("*.demandstudios.com");
a("*.dmtracker.com");
a("*.glimg.net");
a("golflink.com");
a("*.golflink.com");
a("golflink.net");
a("www.golflink.net");
a("greencar.com");
a("*.greencar.com");
a("livestrong.com");
a("*.livestrong.com");
a("i.lsimg.net");

R = new RuleSet("Demand Progress (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?demandprogress\\.org/(cs|image)s/", "https://s3.amazonaws.com/s3.demandprogress.org/$1s/"));
R.rules.push(new Rule("^http://act\\.demandprogress\\.org/", "https://act.demandprogress.org/"));
R.rules.push(new Rule("^http://s3\\.demandprogress\\.org/", "https://s3.amazonaws.com/s3.demandprogress.org/"));
a("demandprogress.org");
a("*.demandprogress.org");

R = new RuleSet("Demandware (partial)");
R.rules.push(new Rule("^http://(www\\.)?demandware\\.(?:com|net)/", "https://$1demandware.com/"));
R.rules.push(new Rule("^http://(labs|xchange)\\.demandware\\.com/", "https://$1.demandware.com/"));
R.rules.push(new Rule("^http://sits-pod(\\d+)\\.demandware\\.net/", "https://sits-pod$1.demandware.net/"));
R.rules.push(new Rule("^http://demandware\\.edgesuite\\.net/aabl_prd/on/demandware\\.static/", "https://labs.demandware.com/on/demandware.static/"));
a("demandware.com");
a("*.demandware.com");
a("demandware.net");
a("*.demandware.net");
a("demandware.edgesuite.net");

R = new RuleSet("DemocracyInAction");
R.rules.push(new Rule("^https?://democracyinaction\\.org/", "https://www2.democracyinaction.org/"));
R.rules.push(new Rule("^http://(caf|hq-org2|hq-salsa|org2|salsa|secure|www2?)\\.democracyinaction\\.org/", "https://$1.democracyinaction.org/"));
a("democracyinaction.org");
a("caf.democracyinaction.org");
a("hq-org2.democracyinaction.org");
a("hq-salsa.democracyinaction.org");
a("org2.democracyinaction.org");
a("salsa.democracyinaction.org");
a("secure.democracyinaction.org");
a("www.democracyinaction.org");
a("www2.democracyinaction.org");

R = new RuleSet("DemocracyNow (partial)");
R.rules.push(new Rule("^http://(www\\.)?democracynow\\.org/", "https://$1democracynow.org/"));
a("democracynow.org");
a("www.democracynow.org");

R = new RuleSet("Demonoid");
R.rules.push(new Rule("^http://(?:www\\.)?demonoid\\.com/", "https://www.demonoid.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?demonoid\\.me/", "https://www.demonoid.me/"));
a("*.demonoid.com");
a("demonoid.com");
a("*.demonoid.me");
a("demonoid.me");

R = new RuleSet("Dephormation.org.uk");
R.rules.push(new Rule("^http://(?:www\\.)?dephormation\\.org\\.uk/", "https://www.dephormation.org.uk/"));
a("dephormation.org.uk");
a("www.dephormation.org.uk");

R = new RuleSet("Deposit Files (partial)");
R.rules.push(new Rule("^http://(www\\.)?depositfiles\\.com/", "https://$1depositfiles.com/"));
R.rules.push(new Rule("^http://(ads|img3|ssl3)\\.depositfiles\\.com/", "https://ssl3.depositfiles.com/"));
a("depositfiles.com");
a("*.depositfiles.com");

R = new RuleSet("DepositProtection");
R.rules.push(new Rule("^http://(?:www\\.)?depositprotection\\.com/", "https://www.depositprotection.com/"));
a("depositprotection.com");
a("www.depositprotection.com");

R = new RuleSet("Deutsche BKK");
R.rules.push(new Rule("^http://(?:www\\.)?deutschebkk\\.de/", "https://www.deutschebkk.de/"));
a("www.deutschebkk.de");
a("deutschebkk.de");

R = new RuleSet("Devstructure");
R.rules.push(new Rule("^http://(www\\.)?devstructure\\.com/", "https://devstructure.com/"));
a("devstructure.com");
a("www.devstructure.com");

R = new RuleSet("Dfri.se");
R.rules.push(new Rule("^http://(?:www\\.)?dfri\\.se/", "https://www.dfri.se/"));
a("dfri.se");
a("www.dfri.se");

R = new RuleSet("Diagonalperiodico.net");
R.rules.push(new Rule("^http://(?:www\\.)?diagonalperiodico\\.net/", "https://www.diagonalperiodico.net/"));
a("diagonalperiodico.net");
a("www.diagonalperiodico.net");

R = new RuleSet("dianomi (partial)");
R.rules.push(new Rule("^http://(?:cdn|www)\\.dianomi\\.com/", "https://www.dianomi.com/"));
a("dianomi.com");
a("*.dianomi.com");

R = new RuleSet("Diasp.org");
R.rules.push(new Rule("^http://(?:www\\.)?diasp\\.org/", "https://diasp.org/"));
a("diasp.org");
a("www.diasp.org");

R = new RuleSet("Diaspora");
R.rules.push(new Rule("^http://(?:www\\.)?joindiaspora\\.com/", "https://joindiaspora.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?diasporafoundation\\.org/", "https://www.diasporafoundation.org/"));
a("joindiaspora.com");
a("www.joindiaspora.com");
a("diasporafoundation.org");
a("www.diasporafoundation.org");

R = new RuleSet("Die-Linke.de");
R.rules.push(new Rule("^http://(?:www\\.)?die-linke\\.de/", "https://www.die-linke.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?linksmail\\.de/", "https://www.linksmail.de/"));
a("die-linke.de");
a("www.die-linke.de");
a("linksmail.de");
a("www.linksmail.de");

R = new RuleSet("Die.net");
R.rules.push(new Rule("^http://(?:www\\.)?die\\.net/", "https://www.die.net/"));
a("die.net");
a("www.die.net");

R = new RuleSet("DigiCert");
R.rules.push(new Rule("^http://(?:www\\.)?digicert\\.com/", "https://www.digicert.com/"));
a("www.digicert.com");
a("digicert.com");

R = new RuleSet("Digital Networks UK (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?dnuk\\.com/(_elements|images)/", "https://secure.dnuk.com/$1/"));
R.rules.push(new Rule("^http://secure\\.dnuk\\.com/", "https://secure.dnuk.com/"));
a("dnuk.com");
a("*.dnuk.com");

R = new RuleSet("Digital River (partial)");
R.rules.push(new Rule("^http://cm\\.commerce5\\.com/", "https://cm.commerce5.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?digitalriver\\.com/", "https://www.digitalriver.com/"));
R.rules.push(new Rule("^http://(([\\w+\\-]+)\\.cfspx|gc|\\w+\\.img)\\.digitalriver\\.com/", "https://$1.digitalriver.com/"));
R.rules.push(new Rule("^http://corporate\\.digitalriver\\.com/DRHM/", "https://corporate.digitalriver.com/DRHM/"));
R.rules.push(new Rule("^http://ui1\\.img\\.digitalrivercontent\\.net/", "https://ui1.img.digitalrivercontent.net/"));
R.rules.push(new Rule("^http://cp\\.element5\\.com/", "https://cp.element5.com/"));
R.rules.push(new Rule("^http://esellerate\\.net/", "https://www.esellerate.net/"));
R.rules.push(new Rule("^http://(publishers\\.|store\\d\\.)?esellerate\\.net/", "https://$1esellerate.net/"));
R.rules.push(new Rule("^http://(www\\.)?findmyorder\\.com/", "https://$1findmyorder.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.frcanalytics\\.com/", "https://$1.frcanalytics.com/"));
R.rules.push(new Rule("^http://(www\\.)?mycommerce\\.com/", "https://mycommerce.com/"));
a("cm.commerce5.com");
a("*.cfspx.digitalriver.com");
a("*.digitalriver.com");
a("*.img.digitalriver.com");
a("ui1.img.digitalrivercontent.net");
a("cp.element5.com");
a("*.esellerate.net");
a("findmyorder.com");
a("www.findmyorder.com");
a("*.frcanalytics.com");
a("mycommerce.com");
a("www.mycommerce.com");

R = new RuleSet("Digital Window (partial)");
R.rules.push(new Rule("^http://(darwin\\.|images\\.|www\\.)?affiliatewindow\\.com/", "https://$1affiliatewindow.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?awin1\\.com/", "https://www.awin1.com/"));
a("affiliatewindow.com");
a("*.affiliatewindow.com");
a("awin1.com");
a("*.awin1.com");

R = new RuleSet("DigitalForensicsMagazine");
R.rules.push(new Rule("^http://digitalforensicsmagazine\\.com/", "https://digitalforensicsmagazine.com/"));
R.rules.push(new Rule("^http://(www)\\.digitalforensicsmagazine\\.com/", "https://$1.digitalforensicsmagazine.com/"));
a("digitalforensicsmagazine.com");
a("www.digitalforensicsmagazine.com");

R = new RuleSet("Digitalegesellschaft");
R.rules.push(new Rule("^http://(?:www\\.)?digitalegesellschaft\\.de/", "https://digitalegesellschaft.de/"));
a("www.digitalegesellschaft.de");
a("digitalegesellschaft.de");

R = new RuleSet("Digitaliseringsstyrelsen");
R.rules.push(new Rule("^http://login\\.sikker-adgang\\.dk/", "https://login.sikker-adgang.dk/"));
a("*.sikker-adgang.dk");

R = new RuleSet("Digitec.ch");
R.rules.push(new Rule("^http://(?:www\\.)?digitec\\.ch/", "https://www.digitec.ch/"));
a("www.digitec.ch");
a("digitec.ch");

R = new RuleSet("DigiumEnterprise.com");
R.rules.push(new Rule("^http://digiumenterprise\\.com/answer/", "https://digiumenterprise.com/answer/"));
a("digiumenterprise.com");

R = new RuleSet("Direct Marketing Association");
R.rules.push(new Rule("^http://(www\\.)?dma\\.org\\.uk/", "https://$1dma.org.uk/"));
a("dma.org.uk");
a("*.dma.org.uk");

R = new RuleSet("DirectSpace");
R.rules.push(new Rule("^http://(www\\.)?directspace\\.net/", "https://directspace.net/"));
a("directspace.net");
a("www.directspace.net");

R = new RuleSet("Directbox");
R.rules.push(new Rule("^http://(?:www\\.)?directbox\\.(?:at|biz|ch|com|de|eu|info|net|tv)/", "https://www.directbox.com/"));
a("directbox.*");
a("www.directbox.at");
a("www.directbox.biz");
a("www.directbox.ch");
a("www.directbox.com");
a("www.directbox.de");
a("www.directbox.eu");
a("www.directbox.info");
a("www.directbox.net");
a("www.directbox.tv");

R = new RuleSet("Directgov (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?consumerdirect\\.gov\\.uk/", "https://www.adviceguide.org.uk/"));
R.rules.push(new Rule("^http://(?:online\\.|www\\.)?businesslink\\.gov\\.uk/", "https://online.businesslink.gov.uk/"));
R.rules.push(new Rule("^http://wck2\\.companieshouse\\.gov\\.uk/", "https://wck2.companieshouse.gov.uk/"));
R.rules.push(new Rule("^http://submissions\\.epetitions\\.direct\\.gov\\.uk/", "https://submissions.epetitions.direct.gov.uk/"));
R.rules.push(new Rule("^http://fco\\.gov\\.uk/", "https://www.fco.gov.uk/"));
R.rules.push(new Rule("^http://secure\\.gamblingcommission\\.gov\\.uk/", "https://secure.gamblingcommission.gov.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?ipo\\.gov\\.uk/", "https://ipo.gov.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?(mi5|sis)\\.gov\\.uk/", "https://www.sis.gov.uk/"));
a("consumerdirect.gov.uk");
a("www.consumerdirect.gov.uk");
a("businesslink.gov.uk");
a("online.businesslink.gov.uk");
a("www.businesslink.gov.uk");
a("wck2.companieshouse.gov.uk");
a("*.epetitions.direct.gov.uk");
a("fco.gov.uk");
a("secure.gamblingcommission.gov.uk");
a("ipo.gov.uk");
a("www.ipo.gov.uk");
a("mi5.gov.uk");
a("www.mi5.gov.uk");
a("sis.gov.uk");
a("www.sis.gov.uk");

R = new RuleSet("Disability.gov");
R.rules.push(new Rule("^http://(www\\.)?disability\\.gov/", "https://www.disability.gov/"));
a("disability.gov");
a("www.disability.gov");

R = new RuleSet("Discogs.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?discogs\\.com/((css|(develop|us)ers|images?)/|help$)", "https://www.discogs.com/$2"));
R.rules.push(new Rule("^http://images\\.discogsmp3\\.com/", "https://images.juno.co.uk/"));
R.rules.push(new Rule("^http://s\\.dsimg\\.com/", "https://www.discogs.com/"));
a("discogs.com");
a("www.discogs.com");
a("images.discogsmp3.com");
a("s.dsimg.com");

R = new RuleSet("Discovery Place");
R.rules.push(new Rule("^http://(?:www\\.)?discoveryplace\\.org/", "https://www.discoveryplace.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?discoveryplacekids\\.org/", "https://www.discoveryplacekids.org/"));
a("discoveryplace.org");
a("www.discoveryplace.org");
a("discoveryplacekids.org");
a("www.discoveryplacekids.org");

R = new RuleSet("Diskusjon");
R.rules.push(new Rule("^http://diskusjon\\.no/", "https://diskusjon.no/"));
R.rules.push(new Rule("^http://www\\.diskusjon\\.no/", "https://www.diskusjon.no/"));
a("diskusjon.no");
a("www.diskusjon.no");

R = new RuleSet("Disqus");
R.rules.push(new Rule("^http://(?:www\\.)?disqus\\.com/", "https://disqus.com/"));
R.rules.push(new Rule("^http://(?:media|secure)(?:cdn)?\\.disqus\\.com/", "https://securecdn.disqus.com/"));
R.rules.push(new Rule("^http://(\\w{1,4}|\\w{6,7}|\\w{10,}|[^m^s]\\w*|\\w*[^a^n])\\.disqus\\.com/", "https://$1.disqus.com/"));
R.exclusions.push(new Exclusion("^http://blog\\."));
R.exclusions.push(new Exclusion("^http://\\w+\\.disqus\\.com/\\d+/build/system/embed\\.js"));
a("disqus.com");
a("*.disqus.com");

R = new RuleSet("Ditt Distrikt");
R.rules.push(new Rule("^http://(?:www\\.)?dittdistrikt\\.no/", "https://www.dittdistrikt.no/"));
a("dittdistrikt.no");
a("www.dittdistrikt.no");

R = new RuleSet("DjurRattsAlliansen.se");
R.rules.push(new Rule("^http://www\\.djurrattsalliansen\\.se/", "https://djurrattsalliansen.se/"));
R.rules.push(new Rule("^http://djurrattsalliansen\\.se/", "https://djurrattsalliansen.se/"));
a("www.djurrattsalliansen.se");
a("djurrattsalliansen.se");

R = new RuleSet("DnB Nor");
R.rules.push(new Rule("^http://(?:www\\.)?dnbnor\\.no/", "https://www.dnbnor.no/"));
a("www.dbnnor.no");
a("dbnnor.no");

R = new RuleSet("Dnsexit");
R.rules.push(new Rule("^http://(?:www\\.)?dnsexit\\.com/", "https://www.dnsexit.com/"));
a("www.dnsexit.com");
a("dnsexit.com");

R = new RuleSet("Docstoc (partial)");
R.rules.push(new Rule("^http://(css|i|swf)\\.docstoc(?:cdn)?\\.com/", "https://$1.docstoccdn.com/"));
R.rules.push(new Rule("^http://img\\.docstoc(?:cdn)?\\.com/", "https://s3.amazonaws.com/img.docstoc.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?docstoc\\.com/(Captcha\\.ashx|cart/)", "https://www.docstoc.com/$1"));
a("docstoc.com");
a("*.docstoc.com");
a("*.docstoccdn.com");

R = new RuleSet("DoctorsWithoutBorders.org");
R.rules.push(new Rule("^http://www\\.doctorswithoutborders\\.org/", "https://www.doctorswithoutborders.org/"));
R.rules.push(new Rule("^http://doctorswithoutborders\\.org/", "https://doctorswithoutborders.org/"));
a("doctorswithoutborders.org");
a("www.doctorswithoutborders.org");

R = new RuleSet("Document.no");
R.rules.push(new Rule("^http://www\\.document\\.no/", "https://www.document.no/"));
R.rules.push(new Rule("^http://document\\.no/", "https://www.document.no/"));
a("document.no");
a("www.document.no");

R = new RuleSet("DocumentCloud (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?documentcloud\\.org/", "https://www.documentcloud.org/"));
R.rules.push(new Rule("^http://s3\\.documentcloud\\.org/", "https://s3.amazonaws.com/s3.documentcloud.org/"));
a("documentcloud.org");
a("*.documentcloud.org");

R = new RuleSet("DomainTools (partial)");
R.rules.push(new Rule("^http://(?:directory\\.|whois\\.|www\\.)?domaintools\\.com/(favicon\\.png$|composite/|images/)", "https://secure.domaintools.com/$1"));
R.rules.push(new Rule("^https://blog\\.domaintools\\.com/wp-content/", "https://blog.domaintools.com/wp-content/"));
R.rules.push(new Rule("^http://img\\.domaintools\\.com/", "https://secure.domaintools.com/images/"));
R.rules.push(new Rule("^http://s(ecure|upport)\\.domaintools\\.com/", "https://s$1.domaintools.com/"));
a("domaintools.com");
a("blog.domaintools.com");
a("directory.domaintools.com");
a("img.domaintools.com");
a("secure.domaintools.com");
a("support.domaintools.com");
a("*.support.domaintools.com");
a("whois.domaintools.com");
a("www.domaintools.com");

R = new RuleSet("Dopplr.com");
R.rules.push(new Rule("^http://(?:www\\.)?dopplr\\.com/", "https://www.dopplr.com/"));
a("dopplr.com");
a("www.dopplr.com");

R = new RuleSet("Dorian Color");
R.rules.push(new Rule("^http://65\\.181\\.183\\.157/", "https://doriancolor.com/"));
R.rules.push(new Rule("^http://(www\\.)?doriancolor\\.com/", "https://$1doriancolor.com/"));
a("65.181.183.157");
a("doriancolor.com");
a("www.doriancolor.com");

R = new RuleSet("Dot5Hosting");
R.rules.push(new Rule("^http://((images|secure|www)\\.)?dot5hosting\\.com/", "https://$1dot5hosting.com/"));
a("dot5hosting.com");
a("*.dot5hosting.com");

R = new RuleSet("Dotster");
R.rules.push(new Rule("^http://dotster\\.com/", "https://dotster.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.dotster\\.com/", "https://$1.dotster.com/"));
a("dotster.com");
a("*.dotster.com");

R = new RuleSet("DownThemAll (partial)");
R.rules.push(new Rule("^http://bugs\\.downthemall\\.net/", "https://bugs.downthemall.net/"));
a("bugs.downthemall.net");

R = new RuleSet("DrAgnDroPbuilder.com");
R.rules.push(new Rule("^http://(www\\.)?dragndropbuilder\\.com/", "https://dragndropbuilder.com/"));
a("dragndropbuilder.com");
a("www.dragndropbuilder.com");

R = new RuleSet("DreamHost (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?dreamhost\\.com/", "https://dreamhost.com/"));
R.rules.push(new Rule("^http://(files|gifts|panel|signup|webftp)\\.dreamhost\\.com/", "https://$1.dreamhost.com/"));
a("dreamhost.com");
a("files.dreamhost.com");
a("gifts.dreamhost.com");
a("panel.dreamhost.com");
a("signup.dreamhost.com");
a("webftp.dreamhost.com");
a("www.dreamhost.com");

R = new RuleSet("DropDav");
R.rules.push(new Rule("^http://(?:www\\.)?dropdav\\.com/", "https://dropdav.com/"));
R.rules.push(new Rule("^http://dav\\.dropdav\\.com/", "https://dav.dropdav.com/"));
a("dropdav.com");
a("www.dropdav.com");
a("dav.dropdav.com");

R = new RuleSet("Dropbox");
R.rules.push(new Rule("^http://(dl|dl-web|files)\\.dropbox\\.com/", "https://$1.dropbox.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?dropbox\\.com/", "https://www.dropbox.com/"));
R.exclusions.push(new Exclusion("http://(?:www\\.)?dropbox.com/frameresize.htm"));
a("www.dropbox.com");
a("dropbox.com");
a("dl.dropbox.com");
a("dl-web.dropbox.com");
a("files.dropbox.com");

R = new RuleSet("Dropcam.com");
R.rules.push(new Rule("^http://dropcam\\.com/", "https://dropcam.com/"));
R.rules.push(new Rule("^http://www\\.dropcam\\.com/", "https://www.dropcam.com/"));
a("dropcam.com");
a("www.dropcam.com");

R = new RuleSet("Drupal");
R.rules.push(new Rule("^http://(?:www\\.)?drupal\\.org/", "https://drupal.org/"));
R.rules.push(new Rule("^http://(sec|association|chicago2011)\\.drupal\\.org/", "https://$1.drupal.org/"));
a("*.drupal.org");
a("drupal.org");

R = new RuleSet("Dr.Web");
R.rules.push(new Rule("^http://www\\.drweb\\.com/", "https://www.drweb.com/"));
R.rules.push(new Rule("^http://st\\.drweb\\.com/", "https://st.drweb.com/"));
R.rules.push(new Rule("^http://drweb\\.com/", "https://www.drweb.com/"));
a("drweb.com");
a("www.drweb.com");
a("st.drweb.com");

R = new RuleSet("DuckDuckGo");
R.rules.push(new Rule("^http://duckduckgo\\.com/", "https://duckduckgo.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.duckduckgo\\.com/", "https://$1.duckduckgo.com/"));
R.rules.push(new Rule("^http://ddg\\.gg/$", "https://duckduckgo.com/"));
R.rules.push(new Rule("^http://duck\\.co/", "https://duck.co/"));
R.rules.push(new Rule("^http://i\\.duck\\.co/", "https://duckduckgo.com/"));
R.exclusions.push(new Exclusion("^http://help\\.duckduckgo\\.com/"));
a("duckduckgo.com");
a("*.duckduckgo.com");
a("ddg.gg");
a("duck.co");
a("i.duck.co");

R = new RuleSet("DynaDot");
R.rules.push(new Rule("^http://(?:www\\.)?dynadot\\.com/", "https://www.dynadot.com/"));
a("dynadot.com");
a("www.dynadot.com");

R = new RuleSet("Dynamite Data (partial)");
R.rules.push(new Rule("^http://(detonator\\.|www\\.)?dynamitedata\\.com/", "https://$1dynamitedata.com/"));
a("dynamitedata.com");
a("*.dynamitedata.com");

R = new RuleSet("Dynamo Dresden");
R.rules.push(new Rule("^http://(?:cms\\.)?dynamo-dresden\\.de/", "https://cms.dynamo-dresden.de/"));
a("cms.dynamo-dresden.de");

R = new RuleSet("Dyson (partial)");
R.rules.push(new Rule("^http://(www\\.)?careers\\.dyson\\.com/", "https://www.careers.dyson.com/"));
R.rules.push(new Rule("^http://media\\.dyson\\.com/", "https://media.dyson.com/"));
R.rules.push(new Rule("^http://(www\\.)?dyson\\.co\\.uk/((combres\\.axd|[iI]mages|Styles|medialibrary|YourAccount)/|RegisterYourMachine\\.aspx$)/", "https://www.dyson.co.uk/$2"));
R.rules.push(new Rule("^http://content\\.dyson\\.co\\.uk/(common|images)/", "https://www.careers.dyson.com/$1/"));
R.rules.push(new Rule("^http://content\\.dyson\\.co\\.uk/Images/", "https://www.dyson.co.uk/medialibrary/Images/Dyson/Site/"));
R.rules.push(new Rule("^http://(www\\.)?dyson\\.ie/", "https://www.dyson.ie/"));
a("careers.dyson.com");
a("www.careers.dyson.com");
a("media.dyson.com");
a("dyson.co.uk");
a("content.dyson.co.uk");
a("www.dyson.co.uk");
a("dyson.ie");
a("www.dyson.ie");

R = new RuleSet("E-boks.dk");
R.rules.push(new Rule("^http://(www\\.)?e-boks\\.dk/", "https://www.e-boks.dk/"));
a("e-boks.dk");
a("www.e-boks.dk");

R = new RuleSet("e-gold (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?e-gold\\.com/", "https://www.e-gold.com/"));
a("e-gold.com");
a("www.e-gold.com");

R = new RuleSet("e621.net");
R.rules.push(new Rule("^http://(?:www\\.)?e621\\.net/", "https://www.e621.net/"));
a("e621.net");
a("www.e621.net");

R = new RuleSet("eBay (partial)");
R.rules.push(new Rule("^http://((gift)?certificates|ocs|spages\\.half)\\.ebay\\.com/", "https://$1.ebay.com/"));
R.rules.push(new Rule("^http://(?:[pq]|(?:secure)?pics)\\.ebaystatic\\.com/", "https://securepics.ebaystatic.com/"));
a("certificates.ebay.com");
a("giftcertificates.ebay.com");
a("spages.half.ebay.com");
a("ocs.ebay.com");
a("p.ebaystatic.com");
a("q.ebaystatic.com");
a("pics.ebaystatic.com");
a("securepics.ebaystatic.com");

R = new RuleSet("ED.gov (partial)");
R.rules.push(new Rule("^https?://(dl\\.)?ed\\.gov/", "https://www.$1ed.gov/"));
R.rules.push(new Rule("^http://(www\\.)?fafsa\\.gov/", "https://fafsa.gov/"));
R.rules.push(new Rule("^http://((schools\\.dl)|ecdrappeals|e-grants|sa|(fafsademo\\.test)|www)\\.ed\\.gov/", "https://$1.ed.gov/"));
R.rules.push(new Rule("^((http://(www\\.)?)|(https://www\\.))(cbfisap|cod|faaaccess|fafsa||fafsalivehelp01||fsawebenroll|nces|pin|studentaid2?|teach-ats|usdoedregistration)\\.ed\\.gov/", "https://$5.ed.gov/"));
R.rules.push(new Rule("^(http://(www\\.)?|https://)(dl|fsadownload|fsaregistration|ifap|nslds|tcli)\\.ed\\.gov/", "https://www.$3.ed.gov/"));
a("ed.gov");
a("www.ed.gov");
a("cbfisap.ed.gov");
a("www.cbfisap.ed.gov");
a("cod.ed.gov");
a("www.cod.ed.gov");
a("dl.ed.gov");
a("www.dl.ed.gov");
a("schools.dl.ed.gov");
a("ecdrappeals.ed.gov");
a("e-grants.ed.gov");
a("faaaccess.ed.gov");
a("www.faaaccess.ed.gov");
a("fafsa.ed.gov");
a("www.fafsa.ed.gov");
a("fafsa.gov");
a("www.fafsa.gov");
a("fafsalivehelp01.ed.gov");
a("www.fafsalivehelp01.ed.gov");
a("fsadownload.ed.gov");
a("www.fsadownload.ed.gov");
a("fsaregistration.ed.gov");
a("www.fsaregistration.ed.gov");
a("fsawebenroll.ed.gov");
a("www.fsawebenroll.ed.gov");
a("ifap.ed.gov");
a("www.ifap.ed.gov");
a("nces.ed.gov");
a("www.nces.ed.gov");
a("nslds.ed.gov");
a("www.nslds.ed.gov");
a("pin.ed.gov");
a("www.pin.ed.gov");
a("sa.ed.gov");
a("studentaid.ed.gov");
a("www.studentaid.ed.gov");
a("studentaid2.ed.gov");
a("www.studentaid2.ed.gov");
a("tcli.ed.gov");
a("www.tcli.ed.gov");
a("teach-ats.ed.gov");
a("www.teach-ats.ed.gov");
a("fafsademo.test.ed.gov");
a("usdoedregistration.ed.gov");
a("www.usdoedregistration.ed.gov");

R = new RuleSet("EDGAR Online");
R.rules.push(new Rule("^http://edgar-online\\.com/", "https://www.edgar-online.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.edgar-online\\.com/", "https://$1.edgar-online.com/"));
a("edgar-online.com");
a("*.edgar-online.com");

R = new RuleSet("EDI Health Group");
R.rules.push(new Rule("^http://(?:www\\.)?claimconnect\\.net/", "https://www.dentalxchange.com/x/claimconnect.jsp"));
R.rules.push(new Rule("^http://(?:www\\.)?(?:dentalxchange\\.com|(edihealth|webclaim)\\.net)/", "https://www.dentalxchange.com/"));
R.rules.push(new Rule("^http://claimconnect\\.dentalxchange\\.com/", "https://claimconnect.dentalxchange.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?edihealth\\.com/", "https://www.dentalxchange.com/x/partners/webclaim.jsp"));
R.rules.push(new Rule("^http://secure\\.payconnect\\.net/", "https://secure.payconnect.net/"));
a("claimconnect.net");
a("www.claimconnect.net");
a("dentalxchange.com");
a("*.dentalxchange.com");
a("edihealth.com");
a("www.edihealth.com");
a("edihealth.net");
a("www.edihealth.net");
a("webclaim.net");
a("www.webclaim.net");
a("secure.payconnect.net");

R = new RuleSet("EDP.pt");
R.rules.push(new Rule("^http://(?:www\\.)?edp\\.pt/", "https://www.edp.pt/"));
a("edp.pt");
a("www.edp.pt");

R = new RuleSet("eDigitalResearch (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?ecustomeropinions\\.com/", "https://ecustomeropinions.com/"));
a("ecustomeropinions.com");
a("www.ecustomeropinions.com");

R = new RuleSet("EFF");
R.rules.push(new Rule("^http://eff\\.org/", "https://eff.org/"));
R.rules.push(new Rule("^http://www\\.eff\\.org/", "https://www.eff.org/"));
R.rules.push(new Rule("^http://secure\\.eff\\.org/shop", "https://secure.eff.org/site/Ecommerce?store_id=2441"));
R.rules.push(new Rule("^http://secure\\.eff\\.org/renew", "https://secure.eff.org/site/Donation2"));
R.rules.push(new Rule("^http://secure\\.eff\\.org/wiretapping", "https://secure.eff.org/site/Donation2?idb=1344423068&df_id=1220"));
R.rules.push(new Rule("^http://secure\\.eff\\.org/donate", "https://secure.eff.org/site/Donation2?idb=43804189&df_id=1200"));
R.rules.push(new Rule("^http://secure\\.eff\\.org/mechaposter", "https://secure.eff.org/site/Ecommerce?VIEW_PRODUCT=true&product_id=2161&store_id=2441"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.eff\\.org/", "https://$1.eff.org/"));
R.rules.push(new Rule("^http://(www\\.)?(globalchokepoints|httpsnow)\\.org/", "https://$1$2.org/"));
R.rules.push(new Rule("^https://www\\.eff\\.org/sites/all/themes/frontier/images/get-https-e.png", "https://www.eff.org/sites/all/themes/frontier/images/got-https-e.png"));
R.rules.push(new Rule("^https://www\\.eff\\.org/sites/all/themes/frontier/images/get-https-e-chrome.png", "https://www.eff.org/sites/all/themes/frontier/images/got-https-e-chrome.png"));
R.exclusions.push(new Exclusion("^http://action\\.eff\\.org/"));
a("*.eff.org");
a("eff.org");
a("globalchokepoints.org");
a("www.globalchokepoints.org");
a("httpsnow.org");
a("www.httpsnow.org");

R = new RuleSet("ELENA");
R.rules.push(new Rule("^http://(www\\.)?das-elena-verfahren\\.de/", "https://www.das-elena-verfahren.de/"));
a("das-elena-verfahren.de");
a("*.das-elena-verfahren.de");

R = new RuleSet("ENTP (partial)");
R.rules.push(new Rule("^http://(my\\.|www\\.)?lighthouseapp\\.com/", "https://$1lighthouseapp.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.lighthouseapp\\.com/(images/|login|pkg/|stylesheets/|users/new)", "https://$1.lighthouseapp.com/$2"));
R.rules.push(new Rule("^http://([\\w\\-]+\\.)?tenderapp\\.com/", "https://$1tenderapp.com/"));
R.exclusions.push(new Exclusion("^http://help\\.lighthouseapp\\."));
R.exclusions.push(new Exclusion("^http://(www\\.)?tenderapp\\.com/$"));
a("lighthouseapp.com");
a("*.lighthouseapp.com");
a("tenderapp.com");
a("asset-0.tenderapp.com");
a("asset-1.tenderapp.com");
a("asset-2.tenderapp.com");
a("help.tenderapp.com");
a("setup.tenderapp.com");
a("www.tenderapp.com");

R = new RuleSet("EPA (.ie)");
R.rules.push(new Rule("^http://(?:www\\.)?epa\\.ie/", "https://www.epa.ie/"));
R.exclusions.push(new Exclusion("^http://gis\\.epa\\.ie/"));
a("www.epa.ie");
a("epa.ie");

R = new RuleSet("EPIC");
R.rules.push(new Rule("^http://(?:www\\.)?epic\\.org/", "https://epic.org/"));
a("epic.org");
a("www.epic.org");

R = new RuleSet("ePay.bg");
R.rules.push(new Rule("^http://(www\\.)?epay\\.bg/", "https://www.epay.bg/"));
a("epay.bg");
a("www.epay.bg");

R = new RuleSet("ESB.ie");
R.rules.push(new Rule("^http://(?:www\\.)?esb\\.ie/", "https://www.esb.ie/"));
R.rules.push(new Rule("^http://(www\\.)?esbie\\.ie/", "https://$1esbie.ie/"));
a("www.esb.ie");
a("esb.ie");
a("www.esbie.ie");
a("esbie.ie");

R = new RuleSet("ESISS");
R.rules.push(new Rule("^http://(?:www\\.)?esiss\\.ac\\.uk/", "https://www.esiss.ac.uk/"));
a("esiss.ac.uk");
a("www.esiss.ac.uk");

R = new RuleSet("ESRB");
R.rules.push(new Rule("^http://(?:www\\.)?esrb\\.org/", "https://www.esrb.org/"));
a("www.esrb.org");
a("esrb.org");

R = new RuleSet("ETS");
R.rules.push(new Rule("^http://(?:www\\.)?ets\\.org/", "https://www.ets.org/"));
R.rules.push(new Rule("^http://(apstudio|ept-elm|gedcalifornia|gresearch|ibtsd3|mygre|onyx|ppi|srp|title2|toefl-registration|toeflrts)\\.ets\\.org/", "https://$1.ets.org/"));
a("ets.org");
a("*.ets.org");

R = new RuleSet("EVGA (partial)");
R.rules.push(new Rule("^http://(www\\.)?evga\\.com/((.+/)?images/|forums/|includes/|support/login\\.asp$|favicon\\.ico$)", "https://www.evga.com/$2"));
R.rules.push(new Rule("^http://((asia|[bfk]r|eu|jp|latam)\\.evga\\.com|(www\\.)?evga\\.com\\.(au|tw))/((.+/)?images/common/|favicon\\.ico$)", "https://www.evga.com/$2"));
a("evga.com");
a("asia.evga.com");
a("br.evga.com");
a("eu.evga.com");
a("fr.evga.com");
a("jp.evga.com");
a("kr.evga.com");
a("latam.evga.com");
a("www.evga.com");
a("evga.com.au");
a("www.evga.com.au");
a("evga.com.tw");
a("www.evga.com.tw");

R = new RuleSet("E. W. Scripps Company (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?andersonvalleypost\\.com/(accounts/(login|password_reset|register)|staff|subscribe)/", "https://www.andersonvalleypost.com/accounts/$1/"));
R.rules.push(new Rule("^http://login\\.andersonvalleypost\\.com/", "https://login.andersonvalleypost.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?commercialappeal\\.com/", "https://www.commercialappeal.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?redding\\.com/", "https://www.redding.com/"));
R.rules.push(new Rule("^http://push\\.scrippsing\\.com/", "https://push.scrippsing.com/"));
a("andersonvalleypost.com");
a("login.andersonvalleypost.com");
a("www.andersonvalleypost.com");
a("commercialappeal.com");
a("www.commercialappeal.com");
a("redding.com");
a("www.redding.com");
a("push.scrippsing.com");

R = new RuleSet("EZTV");
R.rules.push(new Rule("^https?://(?:www\\.)?(ezrss\\.it|eztv\\.it|zoink\\.it|ezimages\\.eu)/", "https://$1/"));
R.rules.push(new Rule("^http://torrent\\.zoink\\.it/", "https://torrent.zoink.it/"));
a("www.ezrss.it");
a("ezrss.it");
a("www.eztv.it");
a("eztv.it");
a("www.zoink.it");
a("zoink.it");
a("www.ezimages.eu");
a("ezimages.eu");

R = new RuleSet("easyDNS (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?easydns\\.net/", "https://www.easydns.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+\\.)?easydns\\.(com|net)/", "https://$1easydns.$2/"));
R.exclusions.push(new Exclusion("^http://(blog2?|helpwiki)\\.easydns\\.com/"));
a("easydns.net");
a("*.easydns.net");
a("easydns.com");
a("*.easydns.com");

R = new RuleSet("EasyNews");
R.rules.push(new Rule("^http://(?:www\\.)?easynews\\.com/", "https://easynews.com/"));
R.rules.push(new Rule("^http://members\\.easynews\\.com/", "https://secure.members.easynews.com/"));
a("www.easynews.com");
a("easynews.com");
a("members.easynews.com");

R = new RuleSet("Ebi.ac.uk");
R.rules.push(new Rule("^http://www\\.ebi\\.ac\\.uk/", "https://www.ebi.ac.uk/"));
R.exclusions.push(new Exclusion("^http://www\\.ebi\\.ac\\.uk/systems-srv/"));
a("www.ebi.ac.uk");

R = new RuleSet("Eclipse (partial)");
R.rules.push(new Rule("^http://bugs\\.eclipse\\.org/", "https://bugs.eclipse.org/"));
R.rules.push(new Rule("^http://dev\\.eclipse\\.org/(custom|large)_icons/", "https://dev.eclipse.org/$1_icons/"));
R.rules.push(new Rule("^http://marketplace(1)?\\.eclipse\\.org/(eclipse\\.org-common|misc|modules|sites)/", "https://marketplace$1.eclipse.org/$2/"));
a("*.eclipse.org");

R = new RuleSet("Ecommerce (partial)");
R.rules.push(new Rule("^http://(www\\.)?ecommerce\\.com/", "https://$1ecommerce.com/"));
R.rules.push(new Rule("^http://((assets|manage|www)\\.)?ixwebhosting\\.com/", "https://$1ixwebhosting.com/"));
R.rules.push(new Rule("^http://email\\.ixwebhosting\\.com/", "https://webmail.opentransfer.com/"));
R.rules.push(new Rule("^https?://(?:www\\.)?opentransfer\\.com/", "https://ecommerce.com/"));
R.rules.push(new Rule("^http://webmail\\.opentransfer\\.com/", "https://webmail.opentransfer.com/"));
R.rules.push(new Rule("^http://(manage\\.|www\\.)?webhost\\.biz/", "https://$1webhost.biz/"));
a("ecommerce.com");
a("www.ecommerce.com");
a("ixwebhosting.com");
a("*.ixwebhosting.com");
a("opentransfer.com");
a("*.opentransfer.com");
a("webhost.biz");
a("*.webhost.biz");

R = new RuleSet("Economic Policy Institute (partial)");
R.rules.push(new Rule("^http://www\\.epi\\.org/page/-/", "https://secure.epi.org/page/-/"));
R.rules.push(new Rule("^http://(my|secure)\\.epi\\.org/", "https://$1.epi.org/"));
a("*.epi.org");
a("*.secure.epi.org");

R = new RuleSet("Economist (partial)");
R.rules.push(new Rule("^http://(www\\.)?economist\\.com/user", "https://www.economist.com/user"));
R.rules.push(new Rule("^http://media\\.economist\\.com/", "https://media.economist.com/"));
a("economist.com");
a("media.economist.com");
a("www.economist.com");

R = new RuleSet("EdUbuntu");
R.rules.push(new Rule("^http://(?:www\\.)?edubuntu\\.org/", "https://edubuntu.org/"));
a("edubuntu.org");
a("www.edubuntu.org");

R = new RuleSet("Edas.info");
R.rules.push(new Rule("^http://(?:www\\.)?edas\\.info/", "https://www.edas.info/"));
a("edas.info");
a("www.edas.info");

R = new RuleSet("EdgeCast Networks (partial)");
R.rules.push(new Rule("^http://wac(?:\\.1ac1)\\.edgecastcdn\\.net/", "https://wac.edgecastcdn.net/"));
R.rules.push(new Rule("^http://(?:wpc\\.\\w{4,4}|ne1\\.wpc)\\.edgecastcdn\\.net/", "https://ne1.wpc.edgecastcdn.net/"));
R.rules.push(new Rule("^http://(ne\\.wa|gs1\\.wp)c\\.edgecastcdn\\.net/", "https://ne.wac.edgecastcdn.net/"));
a("wac.1ac1.edgecastcdn.net");
a("wpc.*.edgecastcdn.net");
a("wac.edgecastcdn.net");
a("ne.wac.edgecastcdn.net");
a("*.wpc.edgecastcdn.net");

R = new RuleSet("edrive hosting (partial)");
R.rules.push(new Rule("^http://(www\\.)?edrive-hosting\\.cz/", "https://$1edrive-hosting.cz/"));
a("edrive-hosting.cz");
a("www.edrive-hosting.cz");

R = new RuleSet("Egg");
R.rules.push(new Rule("^http://(?:new\\.|www\\.)?egg\\.com/", "https://new.egg.com/"));
R.rules.push(new Rule("^http://(your|phonehome)\\.egg\\.com/", "https://$1.egg.com/"));
a("*.egg.com");
a("egg.com");

R = new RuleSet("Egnyte");
R.rules.push(new Rule("^http://(\\w+\\.)?egnyte\\.com/", "https://$1egnyte.com/"));
a("egnyte.com");
a("*.egnyte.com");

R = new RuleSet("Ekiga (partial)");
R.rules.push(new Rule("^http://(www\\.)?ekiga\\.net/", "https://ekiga.net/"));
R.rules.push(new Rule("^http://(www\\.)?ekiga\\.org/sites/all/themes/ekiga_net/", "https://ekiga.net/"));
a("ekiga.net");
a("www.ekiga.net");
a("ekiga.org");
a("www.ekiga.org");

R = new RuleSet("Elanex.biz");
R.rules.push(new Rule("^http://(www\\.)?elanex\\.biz/", "https://www.elanex.biz/"));
a("www.elanex.biz");
a("elanex.biz");

R = new RuleSet("Electronic Arts (partial)");
R.rules.push(new Rule("^http://ea\\.com/", "https://www.ea.com/"));
R.rules.push(new Rule("^http://(activate|ll\\.assets|help|images|(?:www\\.)?jobs|tos|www)\\.ea\\.com/", "https://$1.ea.com/"));
R.rules.push(new Rule("^http://(?:ssl\\.)?resources\\.ea\\.com/", "https://ssl.resources.ea.com/"));
R.rules.push(new Rule("^http://(?:web-)?(static|vassets)\\.ea\\.com/", "https://a248.e.akamai.net/$1.ea.com/"));
R.rules.push(new Rule("^http://support\\.ea\\.com/", "https://help.ea.com/"));
R.rules.push(new Rule("^http://om\\.eamobile\\.com/", "https://eamwebproduction.122.2o7.net/"));
R.rules.push(new Rule("^http://synergy-stage\\.eamobile\\.com/", "https://synergy-stage.eamobile.com/"));
R.rules.push(new Rule("^http://(?:(?:cdn\\.)?www\\.)?easports\\.com/", "https://www.easports.com/"));
R.rules.push(new Rule("^http://origin\\.com/", "https://www.origin.com/"));
R.rules.push(new Rule("^http://www\\.origin\\.com/favicon\\.ico", "https://www.origin.com/favicon.ico"));
R.rules.push(new Rule("^http://(activate|sso)\\.origin\\.com/", "https://$1.origin.com/"));
R.rules.push(new Rule("^http://store\\.origin\\.com/DRHM/Storefront/Site/", "https://store.origin.com/DRHM/Storefront/Site/"));
R.rules.push(new Rule("^http://(?:llnw\\.|www\\.)?thesims3\\.com/", "https://www.thesims3.com/"));
R.rules.push(new Rule("^http://(forum|\\w\\w)\\.thesims3\\.com/", "https://$1.thesims3.com/"));
R.rules.push(new Rule("^http://(\\w\\w\\.)?store\\.thesims3\\.com/(community|content/|css/|images/)", "https://$1store.thesims3.com/$2"));
R.rules.push(new Rule("^http://llnw\\.store\\.thesims3\\.com/", "https://llnw.store.thesims3.com/"));
a("ea.com");
a("*.ea.com");
a("www.*.ea.com");
a("ll.assets.ea.com");
a("ssl.resources.ea.com");
a("om.eamobile.com");
a("synergy-stage.eamobile.com");
a("easports.com");
a("www.easports.com");
a("*.www.easports.com");
a("origin.com");
a("*.origin.com");
a("thesims3.com");
a("*.thesims3.com");
a("*.store.thesims3.com");

R = new RuleSet("Elgiganten.se");
R.rules.push(new Rule("^http://elgiganten\\.se/", "https://www.elgiganten.se/"));
R.rules.push(new Rule("^http://www\\.elgiganten\\.se/", "https://www.elgiganten.se/"));
a("elgiganten.se");

R = new RuleSet("Eloqua");
R.rules.push(new Rule("^http://(?:www\\.)?elq\\.to/", "https://bit.ly/"));
R.rules.push(new Rule("^http://secure\\.eloqua\\.com/", "https://secure.eloqua.com/"));
a("elq.to");
a("www.elq.to");
a("secure.eloqua.com");

R = new RuleSet("Elsevier (partial)");
R.rules.push(new Rule("^http://(?:origin-)?(ars|cdn)\\.els-cdn\\.com/", "https://origin-$1.els-cdn.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?elsevier\\.ca/", "https://www.elsevier.ca/"));
R.rules.push(new Rule("^http://(?:www\\.)?developers\\.elsevier\\.com/", "https://www.developers.elsevier.com/"));
R.rules.push(new Rule("^http://(covers|linkinghub)\\.elsevier\\.com/", "https://$1.elsevier.com/"));
R.rules.push(new Rule("^http://(www\\.)?((asia|eu|mea|us)\\.)?elsevierhealth\\.com/", "https://$1$2elsevierhealth.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?elsevierhealth\\.com\\.au/", "https://www.elsevierhealth.com.au/"));
R.rules.push(new Rule("^http://(www\\.)?elsevierhealth\\.co\\.uk/", "https://$1elsevierheath.co.uk/"));
R.rules.push(new Rule("^http://sciencedirect\\.com/", "https://www.sciencedirect.com/"));
R.rules.push(new Rule("^http://(binary-services|pdn|sdauth|www)\\.sciencedirect\\.com/", "https://$1.sciencedirect.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?(applications|hub)\\.sciverse\\.com/([\\w\\W]+)", "https://www.$1.sciverse.com/$2"));
R.rules.push(new Rule("^http://acw\\.sciverse\\.com/", "https://acw.sciverse.com/"));
R.exclusions.push(new Exclusion("^http://www\\.developers\\.elsevier\\.com/($|action)"));
R.exclusions.push(new Exclusion("^http://(www\\.)?sciencedirect\\.com/($|gadgetservices/)"));
R.exclusions.push(new Exclusion("^http://www\\.(applications|hub)\\.sciverse\\.com/($|action|gadgetservices)"));
a("ars.els-cdn.com");
a("origin-ars.els-cdn.com");
a("cdn.els-cdn.com");
a("origin-cdn.els-cdn.com");
a("elsevier.ca");
a("www.elsevier.ca");
a("covers.elsevier.com");
a("developers.elsevier.com");
a("www.developers.elsevier.com");
a("linkinghub.elsevier.com");
a("elsevierhealth.com");
a("*.elsevierhealth.com");
a("www.*.elsevierhealth.com");
a("elsevierhealth.com.au");
a("www.elsevierhealth.com.au");
a("elsevierhealth.co.uk");
a("www.elsevierhealth.co.uk");
a("sciencedirect.com");
a("*.sciencedirect.com");
a("acw.sciverse.com");
a("applications.sciverse.com");
a("www.applications.sciverse.com");
a("hub.sciverse.com");
a("www.hub.sciverse.com");

R = new RuleSet("Emediate.eu");
R.rules.push(new Rule("^http://eas4\\.emediate\\.eu/", "https://eas4.emediate.eu/"));
a("eas4.emediate.eu");

R = new RuleSet("Empire State College");
R.rules.push(new Rule("^http://(www\\.)?esc\\.edu/", "https://www.esc.edu/"));
a("www.esc.edu");
a("esc.edu");

R = new RuleSet("Employeeexpress.gov");
R.rules.push(new Rule("^((http://(www\\.)?)|https://)employeeexpress\\.gov/", "https://www.employeeexpress.gov/"));
a("employeeexpress.gov");
a("www.employeeexpress.gov");

R = new RuleSet("Emsisoft");
R.rules.push(new Rule("^http://www\\.emsisoft\\.com/", "https://www.emsisoft.com/"));
R.rules.push(new Rule("^http://emsisoft\\.com/", "https://www.emsisoft.com/"));
a("emsisoft.com");
a("www.emsisoft.com");

R = new RuleSet("Encosia");
R.rules.push(new Rule("^http://(?:www\\.|i\\.)?encosia\\.com/", "https://encosia.com/"));
a("encosia.com");
a("www.encosia.com");
a("i.encosia.com");

R = new RuleSet("EnergyStar");
R.rules.push(new Rule("^http://(?:www\\.)?energystar\\.gov/", "https://www.energystar.gov/"));
a("www.energystar.gov");
a("energystar.gov");

R = new RuleSet("Eniro.se");
R.rules.push(new Rule("^http://eniro\\.se/", "https://www.eniro.se/"));
R.rules.push(new Rule("^http://www\\.eniro\\.se/", "https://www.eniro.se/"));
a("eniro.se");

R = new RuleSet("Eniro (partial)");
R.rules.push(new Rule("^http://(www\\.)?eniro\\.se/(webb/)?$", "https://$1eniro.se/$2"));
R.rules.push(new Rule("^http://(www\\.)?eniro\\.se/webmaster-content/partners/", "https://$1eniro.se/webmaster-content/partners/"));
R.rules.push(new Rule("^http://static1\\.eniro\\.com/[\\d\\.]+/components/frontpage/", "https://www.eniro.se/components/frontpage/"));
R.rules.push(new Rule("^http://static1\\.eniro\\.com/img/enirose/favicon\\.ico$", "https://www.eniro.com/favicon.ico"));
R.rules.push(new Rule("^http://static2\\.eniro\\.com/\\d\\d\\d\\d\\.\\d\\d\\.\\d\\d/components/frontpage/css/components/frontpage/", "https://www.eniro.se/components/frontpage/"));
a("eniro.se");
a("*.eniro.se");

R = new RuleSet("Enom");
R.rules.push(new Rule("^http://(?:www\\.)?enom\\.com/", "https://www.enom.com/"));
a("www.enom.com");
a("enom.com");

R = new RuleSet("Enphase Energy (partial)");
R.rules.push(new Rule("^http://(www\\.)?enphase(?:energy)?\\.com/", "https://$1enphase.com/"));
R.rules.push(new Rule("^http://community\\.enphaseenergy\\.com/favicon\\.png", "https://getsatisfaction.com/favicon.png"));
R.rules.push(new Rule("^http://(assets1|enlighten)\\.enphaseenergy\\.com/", "https://$1.enphaseenergy.com/"));
a("enphase.com");
a("www.enphase.com");
a("enphaseenergy.com");
a("*.enphaseenergy.com");

R = new RuleSet("Entanet (partial)");
R.rules.push(new Rule("^http://enta\\.net/", "https://www.enta.net/"));
R.rules.push(new Rule("^http://(billing|synergi|www)\\.enta\\.net/", "https://$1.enta.net/"));
R.rules.push(new Rule("^http://(www\\.)?voipuserportal\\.co\\.uk/", "https://$1voipuserportal.co.uk/"));
a("enta.net");
a("*.enta.net");
a("voipuserportal.co.uk");
a("www.voipuserportal.co.uk");

R = new RuleSet("Entertainment Consumer's Association (partial)");
R.rules.push(new Rule("^http://(?:www\\.)theeca\\.com/(fil|modul|sit)es/", "https://www.theeca.com/$1es/"));
a("theeca.com");
a("www.theeca.com");

R = new RuleSet("Entropia.de");
R.rules.push(new Rule("^http://(www\\.)?entropia\\.de/", "https://entropia.de/"));
a("entropia.de");
a("www.entropia.de");

R = new RuleSet("Envirotrend (partial)");
R.rules.push(new Rule("^http://(www\\.)?envirotrend\\.com\\.au/", "https://envirotrend.com.au/"));
a("envirotrend.com.au");
a("www.envirotrend.com.au");

R = new RuleSet("Epilepsy Foundation of America");
R.rules.push(new Rule("^http://(?:www\\.)?epilepsyfoundation\\.org/", "https://www.epilepsyfoundation.org/"));
a("epilepsyfoundation.org");
a("www.epilepsyfoundation.org");

R = new RuleSet("Epilepsy Ontario");
R.rules.push(new Rule("^http://(?:www\\.)?epilepsyontario\\.org/", "https://www.epilepsyontario.org/"));
R.rules.push(new Rule("^https://epilepsyontario\\.org/", "https://www.epilepsyontario.org/"));
a("epilepsyontario.org");
a("www.epilepsyontario.org");

R = new RuleSet("Epls.gov");
R.rules.push(new Rule("^(http://(www\\.)?|(https://))epls\\.gov/", "https://www.epls.gov/"));
a("epls.gov");
a("www.epls.gov");

R = new RuleSet("Epoxate.com");
R.rules.push(new Rule("^http://epoxate\\.com/", "https://epoxate.com/"));
a("epoxate.com");

R = new RuleSet("Epson.com (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?epson\\.com/", "https://www.epson.com/"));
R.rules.push(new Rule("^http://was\\.epson\\.com/", "https://was.epson.com/"));
R.rules.push(new Rule("^http://pos\\.epson\\.com/", "https://pos.epson.com/"));
R.rules.push(new Rule("^https://(www\\.)?epson\\.com/(([a-zA-Z]([a-zA-Z0-9])+){1})$", "https://$1epson.com/$2"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?epson\\.com/cgi-bin/Store/jsp/Product/Photos.do"));
R.exclusions.push(new Exclusion("^http://(www\\.)?epson\\.com/([a-zA-Z]([a-zA-Z0-9])+){1}$"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?epson\\.com/cgi-bin/Store/consumer/"));
a("www.epson.com");
a("epson.com");
a("was.epson.com");
a("pos.epson.com");

R = new RuleSet("Erowid");
R.rules.push(new Rule("^http://(?:www\\.)?erowid\\.(?:com|org)/", "https://www.erowid.org/"));
a("www.erowid.com");
a("erowid.com");
a("www.erowid.org");
a("*.www.erowid.org");
a("erowid.org");

R = new RuleSet("espacejeux");
R.rules.push(new Rule("^http://(www\\.)?espacejeux\\.com/", "https://www.espacejeux.com/"));
a("www.espacejeux.com");
a("espacejeux.com");

R = new RuleSet("etracker");
R.rules.push(new Rule("^http://etracker\\.com/", "https://www.etracker.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.etracker\\.com/", "https://$1.etracker.com/"));
a("etracker.com");
a("*.etracker.com");

R = new RuleSet("Etsy (partial)");
R.rules.push(new Rule("^http://(www\\.)?etsy\\.com/([\\w\\-]+/)?(assets|files|images|stylesheets)/", "https://$1etsy.com/$2$3/"));
R.rules.push(new Rule("^http://site\\.etsystatic\\.com/", "https://www.etsy.com/"));
a("etsy.com");
a("www.etsy.com");
a("site.etsystatic.com");

R = new RuleSet("Euro-ix.net");
R.rules.push(new Rule("^http://(?:www\\.)?euro-ix\\.net/", "https://www.euro-ix.net/"));
a("euro-ix.net");
a("www.euro-ix.net");

R = new RuleSet("EuroPriSe");
R.rules.push(new Rule("^http://(www\\.)?european-privacy-seal\\.eu/", "https://www.european-privacy-seal.eu/"));
a("european-privacy-seal.eu");
a("www.european-privacy-seal.eu");

R = new RuleSet("Eurogamer (partial)");
R.rules.push(new Rule("^http://images\\.eurogamer\\.net/", "https://images.eurogamer.net/"));
a("images.eurogamer.net");

R = new RuleSet("Europa.eu");
R.rules.push(new Rule("^http://www\\.consilium\\.europa\\.eu/", "https://www.consilium.europa.eu/"));
R.rules.push(new Rule("^http://consilium\\.europa\\.eu/", "https://www.consilium.europa.eu/"));
R.rules.push(new Rule("^http://www\\.ecb\\.europa\\.eu/", "https://www.ecb.europa.eu/"));
R.rules.push(new Rule("^http://www\\.ecb\\.eu/", "https://www.ecb.europa.eu/"));
a("consilium.europa.eu");
a("www.consilium.europa.eu");
a("www.ecb.europa.eu");
a("www.ecb.eu");

R = new RuleSet("European Southern Observatory");
R.rules.push(new Rule("^http://(www\\.)?eso\\.org/", "https://www.eso.org/"));
R.exclusions.push(new Exclusion("^http://www\\.eso\\.org/public/(austria|belgium-(de|fr|nl)|brazil|chile|czechrepublic|denmark|finland|france|germany|italy|netherlands|portugal|spain|sweden)/"));
a("eso.org");
a("www.eso.org");

R = new RuleSet("Eveger");
R.rules.push(new Rule("^http://(www\\.)?eveger\\.de/", "https://www.eveger.de/"));
a("eveger.de");
a("www.eveger.de");

R = new RuleSet("Eventbrite");
R.rules.push(new Rule("^http://([^/:@]*\\.)?eventbrite\\.co(m|\\.uk)/", "https://$1eventbrite.co$2/"));
a("eventbrite.com");
a("*.eventbrite.com");
a("eventbrite.co.uk");
a("*.eventbrite.co.uk");

R = new RuleSet("Evernote");
R.rules.push(new Rule("^http://(?:www\\.)?evernote\\.com/", "https://www.evernote.com/"));
a("www.evernote.com");
a("evernote.com");

R = new RuleSet("Evidon Inc (partial)");
R.rules.push(new Rule("^http://cdn\\.betrad\\.com/", "https://cdn.betrad.com/"));
R.rules.push(new Rule("^http://my\\.betteradvertising\\.com/", "https://my.betteradvertising.com/"));
R.rules.push(new Rule("^http://(info|my)\\.evidon\\.com/", "https://$1.evidon.com/"));
a("cdn.betrad.com");
a("my.betteradvertising.com");
a("*.evidon.com");

R = new RuleSet("examiner.com");
R.rules.push(new Rule("^http://(beacon\\.|cdn2-b\\.|photos\\.)?examiner\\.com/", "https://$1examiner.com/"));
R.rules.push(new Rule("^http://www\\.examiner\\.com/([\\w\\-]+/|About_Examiner|Advertise|arts-entertainment$|careers|interests$|privacy_policy|rss$|[\\w\\-]*sitemap|Terms_of_Use)", "https://www.examiner.com/$1"));
R.rules.push(new Rule("^http://stats\\.examiner\\.com/", "https://examinercom.122.2o7.net/"));
R.rules.push(new Rule("^http://www\\.theexaminer\\.com/([\\w\\-/]+)\\?cid=[\\w\\-]*", "https://www.theexaminer.com/$1"));
R.exclusions.push(new Exclusion("^http://www.examiner.com/tag/"));
a("examiner.com");
a("*.examiner.com");

R = new RuleSet("Express-VPN.com");
R.rules.push(new Rule("^http://(?:www\\.)express-vpn\\.com/", "https://www.express-vpn.com/"));
a("express-vpn.com");
a("www.express-vpn.com");

R = new RuleSet("Extreme Tracking (partial)");
R.rules.push(new Rule("^http://t1\\.extreme-dm\\.com/", "https://t1.extreme-dm.com/"));
a("t1.extreme-dm.com");

R = new RuleSet("EzineArticles");
R.rules.push(new Rule("^http://(?:www\\.)?ezinearticles\\.com/", "https://ezinearticles.com/"));
R.rules.push(new Rule("^http://(subscriptions)\\.ezinearticles\\.com/", "https://$1.ezinearticles.com/"));
a("www.ezinearticles.com");
a("blog.ezinearticles.com");
a("shop.ezinearticles.com");
a("subscriptions.ezinearticles.com");
a("ezinearticles.com");

R = new RuleSet("F-Secure");
R.rules.push(new Rule("^http://(?:www\\.)?f-secure\\.com/", "https://www.f-secure.com/"));
R.rules.push(new Rule("^http://(analysis|backup|backup\\.ob|browsingprotection|msp|my|partnerportal|safelinks)\\.f-secure\\.com/", "https://$1.f-secure.com/"));
a("f-secure.com");
a("www.f-secure.com");
a("analysis.f-secure.com");
a("backup.f-secure.com");
a("backup.ob.f-secure.com");
a("browsingprotection.f-secure.com");
a("msp.f-secure.com");
a("my.f-secure.com");
a("partnerportal.f-secure.com");
a("safelinks.f-secure.com");

R = new RuleSet("FAAN College Network");
R.rules.push(new Rule("^http://(?:www\\.)?faancollegenetwork\\.org/", "https://www.faancollegenetwork.org/"));
a("faancollegenetwork.org");
a("www.faancollegenetwork.org");

R = new RuleSet("FAZ");
R.rules.push(new Rule("^http://fazarchive\\.faz\\.net/(content|css|images)/", "https://fazarchive.faz.net/$1/"));
R.rules.push(new Rule("^http://(faz-community|gets|kfz-versicherung|oersenlexikon|ts)\\.faz\\.net/", "https://$1.faz.net/"));
R.rules.push(new Rule("^http://(verlag\\.|www\\.)?faz\\.(de|net)/(2\\.5\\.7/|cacheproxy300|f30|favicon\\.ico|img/|l\\.gif|polopoly_fs/)", "https://www.faz.net/$2"));
R.rules.push(new Rule("^http://(www\\.)?faz(job\\.net|-institute\\.de)/", "https://faz$2/"));
R.rules.push(new Rule("^http://(rebrush-oas|services)\\.fazjob\\.net/", "https://$1.fazjob.net/"));
a("faz.de");
a("www.faz.de");
a("faz-institute.de");
a("*.faz-institute.de");
a("faz.net");
a("faz-community.faz.net");
a("gets.faz.net");
a("kfz-versicherung.faz.net");
a("oersenlexikon.faz.net");
a("ts.faz.net");
a("verlag.faz.net");
a("www.faz.net");
a("fazjob.net");
a("rebrush-oas.fazjob.net");
a("services.fazjob.net");
a("www.fazjob.net");

R = new RuleSet("FB18_Forum");
R.rules.push(new Rule("^http://(?:www\\.)?fb18\\.de/", "https://www.fb18.de/"));
a("www.fb18.de");
a("fb18.de");

R = new RuleSet("FCPA Blog (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?fcpablog\\.com/", "https://fcpablog.squarespace.com/"));
a("fcpablog.com");
a("www.fcpablog.com");

R = new RuleSet("FHI.se");
R.rules.push(new Rule("^http://www\\.fhi\\.se/", "https://www.fhi.se/"));
R.rules.push(new Rule("^http://fhi\\.se/", "https://fhi.se/"));
a("fhi.se");
a("www.fhi.se");

R = new RuleSet("FHS.se");
R.rules.push(new Rule("^http://fhs\\.se/", "https://www.fhs.se/"));
R.rules.push(new Rule("^http://www\\.fhs\\.se/", "https://www.fhs.se/"));
a("www.fhs.se");
a("fhs.se");

R = new RuleSet("FLOSSManuals.net (partial)");
R.rules.push(new Rule("^http://(?:en\\.|www\\.)?flossmanuals\\.net/", "https://flossmanuals.net/"));
a("flossmanuals.net");
a("en.flossmanuals.net");
a("www.flossmanuals.net");

R = new RuleSet("FMV.se");
R.rules.push(new Rule("^http://www\\.fmv\\.se/", "https://www.fmv.se/"));
R.rules.push(new Rule("^http://fmv\\.se/", "https://www.fmv.se/"));
a("fmv.se");
a("www.fmv.se");

R = new RuleSet("Free Software Foundation");
R.rules.push(new Rule("^http://(?:www\\.)?fsf\\.org/", "https://www.fsf.org/"));
R.rules.push(new Rule("^http://(crm|static)\\.fsf\\.org/", "https://$1.fsf.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?gnu\\.org/", "https://www.gnu.org/"));
R.rules.push(new Rule("^http://lists\\.gnu\\.org/", "https://lists.gnu.org/"));
R.rules.push(new Rule("^http://savannah\\.(non)?gnu\\.org/", "https://savannah.$1gnu.org/"));
R.rules.push(new Rule("^http://lists\\.nongnu\\.org/", "https://lists.nongnu.org/"));
a("fsf.org");
a("crm.fsf.org");
a("www.fsf.org");
a("static.fsf.org");
a("gnu.org");
a("*.gnu.org");
a("savannah.nongnu.org");
a("lists.nongnu.org");

R = new RuleSet("FSFE.org (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?fsfe\\.org/", "https://$1fsfe.org/"));
R.rules.push(new Rule("^http://(www\\.)?fsfeurope\\.org/", "https://$1fsfeurope.org/"));
R.rules.push(new Rule("^http://([bf]\\w+)\\.fsfeurope\\.org/", "https://$1.fsfe.org/"));
a("fsfe.org");
a("blogs.fsfe.org");
a("fellowship.fsfe.org");
a("wiki.fsfe.org");
a("www.fsfe.org");
a("fsfeurope.org");
a("blogs.fsfeurope.org");
a("fellowship.fsfeurope.org");
a("www.fsfeurope.org");

R = new RuleSet("FTD.de");
R.rules.push(new Rule("^http://(?:www\\.)?ftd\\.de/", "https://www.ftd.de/"));
a("www.ftd.de");
a("ftd.de");

R = new RuleSet("Facebook");
R.rules.push(new Rule("^http://(?:www\\.)?facebook\\.com/", "https://www.facebook.com/"));
R.rules.push(new Rule("^http://(developers|login|m|ssl|www\\.v6)\\.facebook\\.com/", "https://$1.facebook.com/"));
R.rules.push(new Rule("^http://(profile|s-static)\\.ak\\.facebook\\.com/", "https://$1.ak.facebook.com/"));
R.rules.push(new Rule("^http://badge\\.facebook\\.com/badge/", "https://www.facebook.com/badge/"));
R.rules.push(new Rule("^https?://(?:de-de\\.|www\\.)?facebook\\.de/", "https://www.facebook.com/"));
R.rules.push(new Rule("^https?://de-de\\.facebook\\.com/", "https://www.facebook.com/"));
R.rules.push(new Rule("^https?://(?:fr-fr\\.|www\\.)?facebook\\.fr/", "https://www.facebook.com/"));
R.rules.push(new Rule("^https?://fr-fr\\.facebook\\.com/", "https://www.facebook.com/"));
R.rules.push(new Rule("^http://connect\\.facebook\\.net/", "https://connect.facebook.net/"));
R.rules.push(new Rule("^http://([^@:\\./]+)\\.fbcdn\\.net/", "https://$1.fbcdn.net/"));
R.rules.push(new Rule("^http://fbcdn-profile-a\\.akamaihd\\.net/", "https://fbcdn-profile-a.akamaihd.net/"));
R.rules.push(new Rule("^http://static\\.ak\\.fbcdn\\.net/", "https://www.facebook.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?fb\\.com/", "https://www.facebook.com/"));
a("facebook.com");
a("*.facebook.com");
a("*.facebook.de");
a("facebook.de");
a("*.facebook.fr");
a("facebook.fr");
a("connect.facebook.net");
a("*.fbcdn.net");
a("fb.com");
a("www.fb.com");
a("fbcdn-profile-a.akamaihd.net");

R = new RuleSet("Facebook Apps");
R.rules.push(new Rule("^http://[a-z][a-z]-[a-z][a-z]\\.facebook\\.com/", "https://www.facebook.com/"));
R.rules.push(new Rule("^http://apps\\.facebook\\.com/", "https://apps.facebook.com/"));
a("facebook.com");
a("*.facebook.com");

R = new RuleSet("Factor.cc");
R.rules.push(new Rule("^http://(www\\.)?factor\\.cc/", "https://factor.cc/"));
a("factor.cc");
a("www.factor.cc");

R = new RuleSet("Fairfax Digital (partial)");
R.rules.push(new Rule("^http://membercentre\\.fairfax\\.com\\.au/", "https://membercentre.fairfax.com.au/"));
a("membercentre.fairfax.com.au");

R = new RuleSet("Fanboy");
R.rules.push(new Rule("^http://(?:www\\.)?fanboy\\.co\\.nz/", "https://secure.fanboy.co.nz/"));
R.rules.push(new Rule("^http://secure\\.fanboy\\.co\\.nz/", "https://secure.fanboy.co.nz/"));
a("fanboy.co.nz");
a("www.fanboy.co.nz");
a("secure.fanboy.co.nz");

R = new RuleSet("Farmaciforbundet.se");
R.rules.push(new Rule("^http://farmaciforbundet\\.se/", "https://www.farmaciforbundet.se/"));
R.rules.push(new Rule("^http://www\\.farmaciforbundet\\.se/", "https://www.farmaciforbundet.se/"));
a("farmaciforbundet.se");
a("www.farmaciforbundet.se");

R = new RuleSet("FAS.org");
R.rules.push(new Rule("^http://www\\.fas\\.org/", "https://www.fas.org/"));
R.rules.push(new Rule("^http://fas\\.org/", "https://fas.org/"));
a("www.fas.org");
a("fas.org");

R = new RuleSet("Fass.se");
R.rules.push(new Rule("^http://fass\\.se/", "https://www.fass.se/"));
R.rules.push(new Rule("^http://www\\.fass\\.se/", "https://www.fass.se/"));
a("fass.se");
a("www.fass.se");

R = new RuleSet("FastWebHost.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?ehostpros\\.com/", "https://$1ehostpros.com/"));
R.rules.push(new Rule("^http://(support\\.|www\\.)?fastwebhost\\.com/", "https://$1fastwebhost.com/"));
a("ehostpros.com");
a("www.ehostpros.com");
a("fastwebhost.com");
a("support.fastwebhost.com");
a("www.fastwebhost.com");

R = new RuleSet("Fastly");
R.rules.push(new Rule("^http://([^@:/]+)?fastly\\.net/", "https://$1fastly.net/"));
a("*.fastly.net");
a("www.fastly.net");

R = new RuleSet("Fastmail");
R.rules.push(new Rule("^http://(?:www\\.)?fastmail\\.fm/", "https://fastmail.fm/"));
a("www.fastmail.fm");
a("fastmail.fm");

R = new RuleSet("FatCow Web Hosting");
R.rules.push(new Rule("^http://(\\w+\\.)?fatcow\\.com(:443)?/", "https://$1fatcow.com$2/"));
a("fatcow.com");
a("*.fatcow.com");

R = new RuleSet("Federal Register");
R.rules.push(new Rule("^http://(www\\.)?federalregister\\.gov/", "https://www.federalregister.gov/"));
a("federalregister.gov");
a("www.federalregister.gov");

R = new RuleSet("Fedora Project");
R.rules.push(new Rule("^http://(www\\.)?fedorahosted\\.org/", "https://fedorahosted.org/"));
R.rules.push(new Rule("^http://fedoraproject\\.org/", "https://fedoraproject.org/"));
R.rules.push(new Rule("^http://(admin|alt|archives|blogs|boot|docs|lists|mirrors|spins|start|talk|www)\\.fedoraproject\\.org/", "https://$1.fedoraproject.org/"));
a("fedorahosted.org");
a("www.fedorahosted.org");
a("fedoraproject.org");
a("*.fedoraproject.org");

R = new RuleSet("FeeFighters");
R.rules.push(new Rule("^http://(?:www\\.)?feefighters\\.com/", "https://feefighters.com/"));
a("feefighters.com");
a("www.feefighters.com");

R = new RuleSet("FeedMyInbox");
R.rules.push(new Rule("^http://(?:www\\.)?feedmyinbox\\.com/", "https://www.feedmyinbox.com/"));
a("www.feedmyinbox.com");
a("feedmyinbox.com");

R = new RuleSet("Fefe");
R.rules.push(new Rule("^http://blog\\.fefe\\.de/", "https://blog.fefe.de/"));
a("blog.fefe.de");

R = new RuleSet("Feide");
R.rules.push(new Rule("^http://idp\\.feide\\.no/", "https://idp.feide.no/"));
a("idp.feide.no");

R = new RuleSet("Feit Electric Company (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?feitbulb\\.com/", "https://secure1.voloper.net/feitbulbs/"));
a("feitbulbs.com");
a("www.feitbulbs.com");

R = new RuleSet("Feross");
R.rules.push(new Rule("^http://(?:www\\.)?feross\\.org/", "https://www.feross.org/"));
a("feross.org");
a("www.feross.org");

R = new RuleSet("FetLife");
R.rules.push(new Rule("^http://(?:www\\.)?fetlife\\.com/", "https://fetlife.com/"));
a("*.fetlife.com");
a("fetlife.com");

R = new RuleSet("FetchBack");
R.rules.push(new Rule("^http://(\\w+\\.)?fetchback\\.com/", "https://$1fetchback.com/"));
a("fetchback.com");
a("*.fetchback.com");

R = new RuleSet("Fianna Fail");
R.rules.push(new Rule("^http://(?:www\\.)?fiannafail\\.ie/", "https://secure.fiannafail.ie/"));
a("www.fiannafail.ie");
a("fiannafail.ie");

R = new RuleSet("Fibank");
R.rules.push(new Rule("^http://(www\\.)?fibank\\.bg/", "https://www.fibank.bg/"));
R.rules.push(new Rule("^http://([^/:@\\.]+\\.)?e-fibank\\.bg/", "https://e-fibank.bg/"));
a("fibank.bg");
a("www.fibank.bg");
a("*.e-fibank.bg");
a("e-fibank.bg");

R = new RuleSet("Fifth Third Bank");
R.rules.push(new Rule("^http://53\\.com/", "https://www.53.com/"));
R.rules.push(new Rule("^http://(reo|sdg2|www)\\.53\\.com/", "https://$1.53.com/"));
a("53.com");
a("*.53.com");

R = new RuleSet("Fight for the Future (partial)");
R.rules.push(new Rule("^http://s3\\.fightforthefuture\\.org/", "https://s3.amazonaws.com/s3.fightforthefuture.org/"));
a("s3.fightforthefuture.org");

R = new RuleSet("FileBox");
R.rules.push(new Rule("^http://(www\\.)?filebox\\.tv/", "https://$1filebox.tv/"));
a("filebox.tv");
a("www.filebox.tv");

R = new RuleSet("Film Threat");
R.rules.push(new Rule("^http://(media2?\\.|www\\.)?filmthreat\\.com/", "https://$1filmthreat.com/"));
a("filmthreat.com");
a("*.filmthreat.com");
a("*.www.filmthreat.com");

R = new RuleSet("Finam (partial)");
R.rules.push(new Rule("^http://fb\\.finam\\.ru/", "https://fb.finam.ru/"));
a("fb.finam.ru");

R = new RuleSet("Find a Babysitter (partial)");
R.rules.push(new Rule("^https?://findababysitter.com.au/", "https://www.findababysitter.com.au/"));
R.rules.push(new Rule("^http://www\\.findababysitter\\.com\\.au/(Account/|[cC]ontent/)", "https://www.findababysitter.com.au/$1"));
a("findababysitter.com.au");
a("www.findababysitter.com.au");

R = new RuleSet("Finn");
R.rules.push(new Rule("^http://finn\\.no/", "https://finn.no/"));
R.rules.push(new Rule("^http://www\\.finn\\.no/", "https://www.finn.no/"));
R.exclusions.push(new Exclusion("^http://labs\\.finn\\.no/"));
R.exclusions.push(new Exclusion("^http://kart\\.finn\\.no/"));
R.exclusions.push(new Exclusion("^http://oppdrag\\.finn\\.no/"));
R.exclusions.push(new Exclusion("^http://katalog\\.finn\\.no/"));
R.exclusions.push(new Exclusion("^http://www\\.katalog\\.finn\\.no/"));
a("finn.no");
a("www.finn.no");

R = new RuleSet("FireHost (partial)");
R.rules.push(new Rule("^http://(www\\.)?firehost\\.com/(/_CaptchaImage\\.axd|assets/|cart|company/contact|partners|protected/|secure-hosting/[\\w\\-]+/configure)", "https://$1firehost.com/$1"));
R.rules.push(new Rule("^http://(developer|my)\\.firehost\\.com/", "https://$1.firehost.com/"));
R.exclusions.push(new Exclusion("^http://www\\.firehost\\.com/(company|compare|customers|details/[\\w\\-]+\\w|secure-hosting(/[^/]?/)?|solutions)?$"));
a("firehost.com");
a("*.firehost.com");

R = new RuleSet("First Central State Bank");
R.rules.push(new Rule("^http://firstcentralsb\\.com/", "https://www.firstcentralsb.com/"));
R.rules.push(new Rule("^http://(([a-zA-Z0-9\\-])+\\.)firstcentralsb\\.com/", "https://$1firstcentralsb.com/"));
a("firstcentralsb.com");
a("*.firstcentralsb.com");

R = new RuleSet("FirstGiving");
R.rules.push(new Rule("^(http://(www\\.)?|https://)firstgiving\\.com/", "https://www.firstgiving.com/"));
a("firstgiving.com");
a("www.firstgiving.com");

R = new RuleSet("Fiskeriverket.se");
R.rules.push(new Rule("^http://fiskeriverket\\.se/", "https://www.fiskeriverket.se/"));
R.rules.push(new Rule("^http://www\\.fiskeriverket\\.se/", "https://www.fiskeriverket.se/"));
a("fiskeriverket.se");
a("www.fiskeriverket.se");

R = new RuleSet("FitBit");
R.rules.push(new Rule("^http://(?:www\\.)?fitbit\\.com/", "https://www.fitbit.com/"));
a("fitbit.com");
a("www.fitbit.com");

R = new RuleSet("FiveTV");
R.rules.push(new Rule("^http://(?:www\\.)?five\\.tv/", "https://www.five.tv/"));
R.rules.push(new Rule("^http://(about|demand|fwd|sso)\\.five\\.tv/", "https://$1.five.tv/"));
a("*.five.tv");
a("five.tv");

R = new RuleSet("Flameeyes (partial)");
R.rules.push(new Rule("^http://www\\.flameeyes\\.eu/img/", "https://blog.flameeyes.eu/images/theme/"));
R.rules.push(new Rule("^http://(blog\\.)?flameeyes\\.eu/", "https://$1flameeyes.eu/"));
a("flameeyes.eu");
a("*.flameeyes.eu");

R = new RuleSet("Flashback.org");
R.rules.push(new Rule("^http://flashback\\.org/", "https://www.flashback.org/"));
R.rules.push(new Rule("^http://www\\.flashback\\.org/", "https://www.flashback.org/"));
a("flashback.org");
a("www.flashback.org");

R = new RuleSet("Flattr");
R.rules.push(new Rule("^http://(?:www\\.)?flattr\\.com/", "https://flattr.com/"));
R.rules.push(new Rule("^http://api\\.flattr\\.com/", "https://api.flattr.com/"));
a("api.flattr.com");
a("www.flattr.com");
a("flattr.com");

R = new RuleSet("Flickr (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?flickr\\.com/", "https://secure.flickr.com/"));
R.rules.push(new Rule("^http://secure\\.flickr\\.com/", "https://secure.flickr.com/"));
R.rules.push(new Rule("^http://static\\.flickr\\.com/", "https://static.flickr.com/"));
R.rules.push(new Rule("^http://(farm[0-7])\\.static\\.flickr\\.com/", "https://$1.static.flickr.com/"));
R.rules.push(new Rule("^http://api\\.flickr\\.com/services/", "https://secure.flickr.com/services/"));
R.rules.push(new Rule("^http://flic\\.kr/p/", "https://secure.flickr.com/photo.gne?short="));
R.rules.push(new Rule("^http://flic\\.kr/f/", "https://secure.flickr.com/short_urls.gne?favorites="));
R.rules.push(new Rule("^http://flic\\.kr/s/", "https://secure.flickr.com/short_urls.gne?photoset="));
R.rules.push(new Rule("^http://flic\\.kr/ps/", "https://secure.flickr.com/short_urls.gne?photostream="));
R.rules.push(new Rule("^http://farm([0-8])\\.staticflickr\\.com/", "https://farm$1.staticflickr.com/"));
a("*.flickr.com");
a("flickr.com");
a("*.static.flickr.com");
a("flic.kr");
a("*.staticflickr.com");

R = new RuleSet("Floor64 (partial)");
R.rules.push(new Rule("^http://(www\\.)?insightcommunity\\.com/", "https://$1insightcommunity.com/"));
R.rules.push(new Rule("^http://(www\\.)?techdirt\\.com/((imag|styl)es/|(register|signin)\\.php)", "https://$1techdirt.com/$2"));
R.rules.push(new Rule("^http://cdn\\.techdirt\\.com/", "https://www.techdirt.com/"));
a("insightcommunity.com");
a("www.insightcommunity.com");
a("techdirt.com");
a("*.techdirt.com");

R = new RuleSet("Florida Institute of Technology (partial)");
R.rules.push(new Rule("^http://(www\\.)?fit\\.edu/", "https://www.fit.edu/"));
R.rules.push(new Rule("^http://(411|(asset|ca|c|event|list|pantherpas|service|track)s|alumni|media|online|spam|webmail)\\.fit\\.edu/", "https://$1.fit.edu/"));
R.rules.push(new Rule("^http://(go|(portal\\.)?my)\\.fit\\.edu/", "https://portal.my.fit.edu/"));
a("fit.edu");
a("alumni.fit.edu");
a("assets.fit.edu");
a("cas.fit.edu");
a("cs.fit.edu");
a("events.fit.edu");
a("lists.fit.edu");
a("media.fit.edu");
a("online.fit.edu");
a("pantherpass.fit.edu");
a("services.fit.edu");
a("spam.fit.edu");
a("tracks.fit.edu");
a("webmail.fit.edu");
a("www.fit.edu");

R = new RuleSet("FluxBB.org");
R.rules.push(new Rule("^http://(?:www\\.)?fluxbb\\.org/", "https://fluxbb.org/"));
a("www.fluxbb.org");
a("fluxbb.org");

R = new RuleSet("Focus.de");
R.rules.push(new Rule("^http://(www\\.)?focus\\.de/", "https://www.focus.de/"));
R.rules.push(new Rule("^http://p4\\.focus\\.de/", "https://p4.focus.de/"));
a("www.focus.de");
a("focus.de");
a("p4.focus.de");

R = new RuleSet("FoeBuD e.V.");
R.rules.push(new Rule("^http://(www\\.)?foebud\\.org/", "https://www.foebud.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.foebud\\.org/", "https://$1.foebud.org/"));
a("foebud.org");
a("*.foebud.org");

R = new RuleSet("Fokus Bank");
R.rules.push(new Rule("^http://fokus\\.no/", "https://www.fokus.no/"));
R.rules.push(new Rule("^http://www\\.fokus\\.no/", "https://www.fokus.no/"));
a("fokus.no");
a("www.fokus.no");

R = new RuleSet("Folksam.se");
R.rules.push(new Rule("^http://www\\.folksam\\.se/", "https://www.folksam.se/"));
R.rules.push(new Rule("^http://folksam\\.se/", "https://www.folksam.se/"));
a("folksam.se");
a("www.folksam.se");

R = new RuleSet("Fontdeck (partial)");
R.rules.push(new Rule("^http://(www\\.)?fontdeck\\.com/(images/|login$|register$|stylesheets/)", "https://fontdeck.com/$2"));
R.rules.push(new Rule("^http://f\\.fontdeck\\.com/", "https://f.fontdeck.com/"));
a("fontdeck.com");
a("f.fontdeck.com");
a("www.fontdeck.com");

R = new RuleSet("Fontspring");
R.rules.push(new Rule("^http://(www\\.)?fontspring\\.com/", "https://$1fontspring.com/"));
a("fontspring.com");
a("*.fontspring.com");

R = new RuleSet("FooFighters");
R.rules.push(new Rule("^http://(?:www\\.)?foofighters\\.com/", "https://www.foofighters.com/"));
a("foofighters.com");
a("www.foofighters.com");

R = new RuleSet("Food Allergy Initiative");
R.rules.push(new Rule("^http://(?:www\\.)?faiusa\\.org/", "https://www.faiusa.org/"));
a("faiusa.org");
a("www.faiusa.org");

R = new RuleSet("Food Allergy & Anaphylaxis Network");
R.rules.push(new Rule("^http://(?:www\\.)?foodallergy\\.org/", "https://www.foodallergy.org/"));
a("foodallergy.org");
a("www.foodallergy.org");

R = new RuleSet("Forbrukerraadet");
R.rules.push(new Rule("^http://(?:www\\.)?forbrukerportalen\\.no/", "https://forbrukerportalen.no/"));
a("www.forbrukerportalen.no");
a("forbrukerportalen.no");

R = new RuleSet("Forex-Metal");
R.rules.push(new Rule("^http://(?:www\\.)?forex-metal\\.com/", "https://forex-metal.com/"));
a("forex-metal.com");
a("www.forex-metal.com");

R = new RuleSet("Foris Wine");
R.rules.push(new Rule("^http://(?:www\\.)?foriswine\\.com/", "https://www.foriswine.com/"));
a("foriswine.com");
a("www.foriswine.com");

R = new RuleSet("Formstack (partial)");
R.rules.push(new Rule("^http://(www\\.)?formstack\\.com/", "https://$1formstack.com/forms/"));
R.rules.push(new Rule("^http://blog\\.formstack\\.com/favicon\\.ico$", "https://www.formstack.com/favicon.ico"));
R.rules.push(new Rule("^http://(?:blog\\.formstack\\.com/wp-content/themes/fontstack-theme|support.formstack.com/assets)/images/bg\\.jpg$", "https://www.formstack.com/assets/images/bg.jpg"));
R.exclusions.push(new Exclusion("^http://www\\.formstack\\.com/forms/$"));
a("formstack.com");
a("*.formstack.com");

R = new RuleSet("Forsakringskassan.se");
R.rules.push(new Rule("^http://www\\.forsakringskassan\\.se/", "https://www.forsakringskassan.se/"));
R.rules.push(new Rule("^http://forsakringskassan\\.se/", "https://www.forsakringskassan.se/"));
a("www.forsakringskassan.se");
a("forsakringskassan.se");

R = new RuleSet("Forsvarsforbundet.se");
R.rules.push(new Rule("^http://forsvarsforbundet\\.se/", "https://www.forsvarsforbundet.se/"));
R.rules.push(new Rule("^http://www\\.forsvarsforbundet\\.se/", "https://www.forsvarsforbundet.se/"));
a("forsvarsforbundet.se");
a("www.forsvarsforbundet.se");

R = new RuleSet("Fortum.se");
R.rules.push(new Rule("^http://fortum\\.se/", "https://www.fortum.se/"));
R.rules.push(new Rule("^http://www\\.fortum\\.se/", "https://www.fortum.se/"));
R.rules.push(new Rule("^http://fortum\\.fi/", "https://www.fortum.fi/"));
R.rules.push(new Rule("^http://www\\.fortum\\.fi/", "https://www.fortum.fi/"));
a("fortum.se");
a("www.fortum.se");
a("fortum.fi");
a("www.fortum.fi");

R = new RuleSet("FortuneTango");
R.rules.push(new Rule("^http://(www\\.)?fortunetango\\.com/", "https://$1fortunetango.com/"));
a("fortunetango.com");
a("www.fortunetango.com");

R = new RuleSet("Fosdem.org");
R.rules.push(new Rule("^http://(www\\.)?fosdem\\.org/", "https://www.fosdem.org/"));
a("fosdem.org");
a("www.fosdem.org");

R = new RuleSet("Foursquare.com");
R.rules.push(new Rule("^http://(?:www\\.)?foursquare\\.com/", "https://foursquare.com/"));
a("foursquare.com");
a("www.foursquare.com");

R = new RuleSet("FreeDesktop Bugzilla");
R.rules.push(new Rule("^http://bug(?:s|zilla)\\.freedesktop\\.org/", "https://bugs.freedesktop.org/"));
a("bugs.freedesktop.org");
a("bugzilla.freedesktop.org");

R = new RuleSet("Freecycle (partial)");
R.rules.push(new Rule("^http://(butler|(web)?mail)\\.freecycle\\.org/", "https://$1.freecycle.org/"));
a("*.freecycle.org");

R = new RuleSet("Freedom to Tinker");
R.rules.push(new Rule("^http://(?:www\\.)?freedom-to-tinker\\.com/", "https://www.freedom-to-tinker.com/"));
a("freedom-to-tinker.com");
a("www.freedom-to-tinker.com");

R = new RuleSet("Freedombox Foundation");
R.rules.push(new Rule("^http://(?:www\\.)?freedomboxfoundation\\.org/", "https://www.freedomboxfoundation.org/"));
a("freedomboxfoundation.org");
a("www.freedomboxfoundation.org");

R = new RuleSet("Freelancer");
R.rules.push(new Rule("^http://(www\\.)?freelancer\\.(com|co\\.uk)/", "https://www.freelancer.$2/"));
R.rules.push(new Rule("^http://(cdn[0-9]+)\\.freelancer\\.(com|co\\.uk)/", "https://$1.freelancer.$2/"));
a("freelancer.com");
a("*.freelancer.com");
a("freelancer.co.uk");
a("*.freelancer.co.uk");

R = new RuleSet("Freenet");
R.rules.push(new Rule("^http://freenetproject\\.org/", "https://freenetproject.org/"));
R.rules.push(new Rule("^http://downloads\\.freenetproject\\.org/", "https://downloads.freenetproject.org/"));
R.rules.push(new Rule("^http://emu\\.freenetproject\\.org/", "https://emu.freenetproject.org/"));
R.rules.push(new Rule("^http://bugs\\.freenetproject\\.org/", "https://bugs.freenetproject.org/"));
R.rules.push(new Rule("^http://checksums\\.freenetproject\\.org/", "https://checksums.freenetproject.org/"));
a("*.freenetproject.org");
a("freenetproject.org");

R = new RuleSet("Freie Universität Berlin (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?spline\\.inf\\.fu-berlin\\.de/", "https://www.spline.inf.fu-berlin.de/"));
a("spline.inf.fu-berlin.de");
a("www.spline.inf.fu-berlin.de");

R = new RuleSet("FriBID.se");
R.rules.push(new Rule("^http://fribid\\.se/", "https://fribid.se/"));
R.rules.push(new Rule("^http://www\\.fribid\\.se/", "https://www.fribid.se/"));
a("fribid.se");
a("www.fribid.se");

R = new RuleSet("Frictional Games (partial)");
R.rules.push(new Rule("^http://(shelf\\.|www\\.)?frictionalgames\\.com/", "https://$1frictionalgames.com/"));
a("frictionalgames.com");
a("*.frictionalgames.com");

R = new RuleSet("Fridge");
R.rules.push(new Rule("^http://(?:www\\.)?frid\\.ge/", "https://frid.ge/"));
a("frid.ge");
a("www.frid.ge");

R = new RuleSet("Friendfeed");
R.rules.push(new Rule("^http://(?:www\\.)?friendfeed\\.com/", "https://friendfeed.com/"));
a("www.friendfeed.com");
a("friendfeed.com");

R = new RuleSet("Friends of WikiLeaks");
R.rules.push(new Rule("^http://(www\\.)?wlfriends\\.org/", "https://wlfriends.org/"));
a("wlfriends.org");
a("www.wlfriends.org");

R = new RuleSet("Frontier Network and Computing Systems");
R.rules.push(new Rule("^http://(webid\\.|www\\.)?fcns\\.eu/", "https://$1fcns.eu/"));
a("fcns.eu");
a("*.fcns.eu");

R = new RuleSet("Frontline Defenders");
R.rules.push(new Rule("^http://(www\\.)?frontlinedefenders\\.org/", "https://$1frontlinedefenders.org/"));
a("www.frontlinedefenders.org");
a("frontlinedefenders.org");

R = new RuleSet("FrostWire (partial)");
R.rules.push(new Rule("^http://static\\.frostwire\\.com/", "https://s3.amazonaws.com/static.frostwire.com/"));
a("static.frostwire.com");

R = new RuleSet("Fujitsu (partial)");
R.rules.push(new Rule("^http://img\\.jp\\.fujitsu\\.com/", "https://jp.fujitsu.com/"));
R.rules.push(new Rule("^http://jp\\.fujitsu\\.com/(cssv4|imgv[34])", "https://jp.fujitsu.com/$1"));
R.exclusions.push(new Exclusion("^http://(img\\.)?jp\\.fujitsu\\.com/imgv4/jp/"));
a("jp.fujitsu.com");
a("img.jp.fujitsu.com");

R = new RuleSet("Full Circle Studies (partial)");
R.rules.push(new Rule("^http://my\\.comscore\\.com/", "https://my.comscore.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?fullcirclestudies\\.com/", "https://www.fullcirclestudies.com/"));
R.rules.push(new Rule("^http://s?b\\.scorecardresearch\\.com/", "https://sb.scorecardresearch.com/"));
a("my.comscore.com");
a("fullcirclestudies.com");
a("www.fullcirclestudies.com");
a("*.scorecardresearch.com");

R = new RuleSet("FundaGeek (partial)");
R.rules.push(new Rule("^http://(mail\\.|www\\.)?fundageek\\.com/", "https://$1fundageek.com/"));
a("*.fundageek.com");

R = new RuleSet("Fused (partial)");
R.rules.push(new Rule("^http://s7\\.fused\\.com/", "https://s7.fused.com/"));
a("s7.fused.com");

R = new RuleSet("FusionForge");
R.rules.push(new Rule("^http://(www\\.)?fusionforge\\.org/", "https://$1fusionforge.org/"));
a("fusionforge.org");
a("*.fusionforge.org");

R = new RuleSet("FusionIO");
R.rules.push(new Rule("^http://fusionio\\.com/", "https://fusionio.com/"));
R.rules.push(new Rule("^http://(www|support|quote)\\.fusionio\\.com/", "https://$1.fusionio.com/"));
a("fusionio.com");
a("www.fusionio.com");
a("support.fusionio.com");
a("quote.fusionio.com");

R = new RuleSet("FusionNet");
R.rules.push(new Rule("^http://fusion-net\\.co\\.uk/", "https://fusion-net.co.uk/"));
R.rules.push(new Rule("^http://www\\.fusion-net\\.co\\.uk/", "https://www.fusion-net.co.uk/"));
a("fusion-net.co.uk");
a("www.fusion-net.co.uk");

R = new RuleSet("Future Publishing (partial)");
R.rules.push(new Rule("^http://computerandvideogames\\.com/", "https://www.computerandvideogames.com/"));
R.rules.push(new Rule("^http://www\\.computerandvideogames\\.com/(reg|templates)/", "https://www.computerandvideogames.com/$1/"));
R.rules.push(new Rule("^http://(?:cdn\\.)?static\\.computerandvideogames\\.com/", "https://www.computerandvideogames.com/templates/"));
a("computerandvideogames.com");
a("*.computerandvideogames.com");
a("cdn.static.computerandvideogames.com");

R = new RuleSet("FutureQuest Support");
R.rules.push(new Rule("^http://(www\\.)?service\\.futurequest\\.net/", "https://service.futurequest.net/"));
a("service.futurequest.net");

R = new RuleSet("G5 - US Department of Education");
R.rules.push(new Rule("^(http://(www\\.)?|https://)g5\\.gov/", "https://www.g5.gov/"));
a("g5.gov");
a("www.g5.gov");

R = new RuleSet("GKG");
R.rules.push(new Rule("^http://(?:www\\.)?gkg\\.net/", "https://www.gkg.net/"));
a("gkg.net");
a("www.gkg.net");

R = new RuleSet("GLAD (Gay & Lesbian Advocates & Defenders)");
R.rules.push(new Rule("^http://(?:www\\.)?glad\\.org/", "https://www.glad.org/"));
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.glad\\.org/", "https://$1.glad.org/"));
R.rules.push(new Rule("^https://glad\\.org/", "https://www.glad.org/"));
a("glad.org");
a("*.glad.org");

R = new RuleSet("GLS Bank");
R.rules.push(new Rule("^http://(www\\.)?gls\\.de/", "https://www.gls.de/"));
R.rules.push(new Rule("^http://gls\\.gls-service\\.de/", "https://gls.gls-service.de/"));
a("www.gls.de");
a("gls.de");
a("gls.gls-service.de");

R = new RuleSet("GMX", "http:.*gmx\\.");
R.rules.push(new Rule("^http://(img|js|sec-10)\\.gmx\\.net/", "https://$1.gmx.net/"));
R.rules.push(new Rule("^http://img\\.ui-portal\\.de/", "https://img.ui-portal.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?gmx\\.(?:ca|it|se|ru)/", "https://www.gmx.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?gmx\\.(at|ch|com|co\\.uk|fr|net)/", "https://www.gmx.$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?gmx\\.de/", "https://www.gmx.net/"));
R.rules.push(new Rule("^http://service\\.gmx\\.(com|net)/", "https://service.gmx.$1/"));
R.rules.push(new Rule("^http://help\\.gmx\\.com/", "https://help.gmx.com/"));
R.rules.push(new Rule("^http://storage-file-eu\\.gmx\\.com/", "https://storage-file-eu.gmx.com/"));
a("www.gmx.*");
a("gmx.*");
a("www.gmx.co.uk");
a("gmx.co.uk");
a("*.gmx.com");
a("*.gmx.net");
a("img.ui-portal.de");

R = new RuleSet("GNOME");
R.rules.push(new Rule("^http://(bugzilla|mail|live)\\.gnome\\.org/", "https://$1.gnome.org/"));
a("bugzilla.gnome.org");
a("mail.gnome.org");
a("live.gnome.org");

R = new RuleSet("GPLHost (partial)");
R.rules.push(new Rule("^http://dtc(\\.sharedfr|\\.node\\d{1,5})?\\.gplhost\\.com/", "https://dtc$1.gplhost.com/"));
R.rules.push(new Rule("^http://dtc\\.gplhost\\.co\\.uk/", "https://dtc.gplhost.co.uk/"));
a("dtc.gplhost.com");
a("dtc.*.gplhost.com");
a("dtc.gplhost.co.uk");

R = new RuleSet("GPUL.org (partial)");
R.rules.push(new Rule("^http://(www\\.)?gpul\\.org/", "https://gpul.org/"));
R.rules.push(new Rule("^http://(2012\\.|www\\.)?guadec\\.org/sites/", "https://gpul.org/sites/"));
a("gpul.org");
a("www.gpul.org");
a("guadec.org");
a("2012.guadec.org");
a("www.guadec.org");

R = new RuleSet("Gibson Research");
R.rules.push(new Rule("^http://(?:www\\.)?grc\\.com/", "https://www.grc.com/"));
a("www.grc.com");
a("grc.com");

R = new RuleSet("GRSecurity.net");
R.rules.push(new Rule("^http://(?:www\\.)?(cvsweb\\.|forums\\.)?grsecurity\\.net/", "https://$1grsecurity.net/"));
a("grsecurity.net");
a("*.grsecurity.net");
a("*.forums.grsecurity.net");

R = new RuleSet("GU.se");
R.rules.push(new Rule("^http://gu\\.se/", "https://www.gu.se/"));
R.rules.push(new Rule("^http://www\\.gu\\.se/", "https://www.gu.se/"));
a("www.gu.se");
a("gu.se");

R = new RuleSet("Game Show Network (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?tv\\.gsn\\.com/", "https://www.tv.gsn.com/"));
R.rules.push(new Rule("^http://(www\\.)?gsn\\.com/(cgi/(account/register|cash/wwcpa/register|nosession/)|dynamic/|forums/)", "https://$1gsn.com/$2"));
R.rules.push(new Rule("^http://(www\\.)?worldwinner\\.com/(cgi/(login\\.html|nosession/)|dynamic/|images/)", "https://$1worldwinner.com/$2"));
R.rules.push(new Rule("^http://cdn\\.worldwinner\\.com/", "https://gp1.wpc.edgecastcdn.net/"));
a("gsn.com");
a("*.gsn.com");
a("www.tv.gsn.com");
a("worldwinner.com");
a("*.worldwinner.com");

R = new RuleSet("Gandi");
R.rules.push(new Rule("^http://(?:www\\.)?gandi\\.net/", "https://www.gandi.net/"));
a("gandi.net");
a("*.gandi.net");

R = new RuleSet("Gannet Company (partial)");
R.rules.push(new Rule("^http://(?:(origin-)?cmsimg)?floridatoday\\.com/", "https://www.floridatoday.com/"));
R.rules.push(new Rule("^http://((origin-)?www)\\.floridatoday\\.com/", "https://$1.floridatoday.com/"));
R.rules.push(new Rule("^http://ads\\.flatdy\\.net/", "https://ads.flatdy.net/"));
R.rules.push(new Rule("^http://(www\\.)?shoplocal\\.com/", "https://$1shoplocal.com/"));
a("ads.flatdy.com");
a("floridatoday.com");
a("*.floridatoday.com");
a("shoplocal.com");
a("www.shoplocal.com");

R = new RuleSet("Gartner.com");
R.rules.push(new Rule("^http://(?:www\\.)?gartner\\.com/", "https://www.gartner.com/"));
R.rules.push(new Rule("^http://imagesrv\\.gartner\\.com/", "https://imagesrv.gartner.com/"));
a("gartner.com");
a("imagesrv.gartner.com");
a("www.gartner.com");

R = new RuleSet("Gateway State Bank");
R.rules.push(new Rule("^http://gatewaysb\\.com/", "https://www.gatewaysb.com/"));
R.rules.push(new Rule("^http://(([a-zA-Z0-9\\-])+\\.)gatewaysb\\.com/", "https://$1gatewaysb.com/"));
a("gatewaysb.com");
a("*.gatewaysb.com");

R = new RuleSet("Gawker (partial)");
R.rules.push(new Rule("^http://(api|login)\\.gawker\\.com/", "https://$1.gawker.com/"));
a("api.gawker.com");
a("login.gawker.com");

R = new RuleSet("G Data Software");
R.rules.push(new Rule("^http://www\\.gdata-software\\.com/", "https://www.gdata-software.com/"));
R.rules.push(new Rule("^http://gdata-software\\.com/", "https://gdata-software.com/"));
a("gdata-software.com");
a("www.gdata-software.com");

R = new RuleSet("Geek.net");
R.rules.push(new Rule("^http://(?:www\\.)?freecode\\.com/(avatars|images|password_resets|screenshots|session|user)/", "https://freecode.com/$1/"));
R.rules.push(new Rule("^http://(www\\.)?geek\\.net/", "https://$1geek.net/"));
R.rules.push(new Rule("^http://(\\w+\\.)?slashdot\\.org/favicon\\.ico$", "https://tv.slashdot.org/wp-content/themes/TVslashdot/images/favicon.ico"));
R.rules.push(new Rule("^http://(www\\.)?slashdot\\.org/(login\\.pl|my/mailpassword|submission)", "https://$1slashdot.org/$2"));
R.rules.push(new Rule("^http://tv\\.slashdot\\.org/", "https://tv.slashdot.org/"));
a("freecode.com");
a("www.freecode.com");
a("www.geek.net");
a("geek.net");
a("slashdot.org");
a("*.slashdot.org");

R = new RuleSet("GeekWire (partial)");
R.rules.push(new Rule("^http://cdn\\.geekwire\\.com/", "https://s3.amazonaws.com/geekwire/"));
a("cdn.geekwire.com");

R = new RuleSet("General Electric (partial)");
R.rules.push(new Rule("^http://files\\.([^\\.]+)\\.geblogs\\.com/", "https://s3.amazonaws.com/files.$1.geblogs.com/"));
a("files.*.geblogs.com");

R = new RuleSet("Generalitat of Catalonia (partial)");
R.rules.push(new Rule("^http://(www\\.)?gencat\\.cat/", "https://$1gencat.cat/"));
R.rules.push(new Rule("^http://www20\\.gencat\\.cat/(doc|portal/template)s/", "https://www20.gencat.cat/$1s/"));
a("gencat.cat");
a("*.gencat.cat");

R = new RuleSet("Gentoo (partial)");
R.rules.push(new Rule("^https?://store\\.gentoo\\.org/", "https://www.cafepress.com/officialgentoo"));
R.rules.push(new Rule("^http://(\\w+)\\.gentoo\\.org/", "https://$1.gentoo.org/"));
R.exclusions.push(new Exclusion("^http://(anoncvs|devmanual|foundation|git\\.overlays|packages|sidebar|www)\\."));
a("*.gentoo.org");
a("*.forums.gentoo.org");

R = new RuleSet("George Mason University (partial)");
R.rules.push(new Rule("^http://gmu\\.edu/", "https://www.gmu.edu/"));
R.rules.push(new Rule("^http://(chnm|www)\\.gmu\\.edu/", "https://$1.gmu.edu/"));
a("gmu.edu");
a("chnm.gmu.edu");
a("www.gmu.edu");

R = new RuleSet("georgetown.edu");
R.rules.push(new Rule("^http://www\\.law\\.georgetown\\.edu/", "https://www.law.georgetown.edu/"));
R.rules.push(new Rule("^http://www\\.georgetown\\.edu/", "https://www.georgetown.edu/"));
R.rules.push(new Rule("^http://georgetown\\.edu/", "https://www.georgetown.edu/"));
a("www.law.georgetown.edu");
a("www.georgetown.edu");
a("georgetown.edu");

R = new RuleSet("GeoTrust");
R.rules.push(new Rule("^http://(?:www\\.)?geotrust\\.com/", "https://www.geotrust.com/"));
a("www.geotrust.com");
a("geotrust.com");

R = new RuleSet("German Design Council");
R.rules.push(new Rule("^http://(www\\.)?german-design-council\\.de/", "https://$1german-design-council.de/"));
a("german-design-council.de");
a("*.german-design-council.de");

R = new RuleSet("GetFirebug");
R.rules.push(new Rule("^http://(?:www\\.)?(blog\\.)?getfirebug\\.com/", "https://$1getfirebug.com/"));
a("*.getfirebug.com");
a("getfirebug.com");

R = new RuleSet("GetPersonas.com");
R.rules.push(new Rule("^http://(?:www\\.)?getpersonas\\.com/", "https://www.getpersonas.com/"));
a("getpersonas.com");
a("www.getpersonas.com");

R = new RuleSet("GetClicky");
R.rules.push(new Rule("^http://getclicky\\.com/", "https://getclicky.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.getclicky\\.com/", "https://$1.getclicky.com/"));
R.rules.push(new Rule("^http://hello\\.staticstuff\\.net/", "https://hello.staticstuff.net/"));
R.rules.push(new Rule("^http://(?:win\\.|www\\.)?staticstuff\\.net/", "https://win.staticstuff.net/"));
a("getclicky.com");
a("*.getclicky.com");
a("staticstuff.net");
a("*.staticstuff.net");
a("*.hello.staticstuff.net");

R = new RuleSet("Getdigital.de");
R.rules.push(new Rule("^http://(www\\.)?getdigital\\.de/", "https://www.getdigital.de/"));
a("www.getdigital.de");
a("getdigital.de");

R = new RuleSet("Getsatisfaction.com");
R.rules.push(new Rule("^http://(www\\.)?getsatisfaction\\.com/", "https://$1getsatisfaction.com/"));
R.rules.push(new Rule("^http://assets(\\d)\\.getsatisfaction\\.com/", "https://assets$1.getsatisfaction.com/"));
a("getsatisfaction.com");
a("*.getsatisfaction.com");

R = new RuleSet("Ghostery");
R.rules.push(new Rule("^http://(www\\.)?ghostery\\.com/", "https://www.ghostery.com/"));
a("www.ghostery.com");
a("ghostery.com");

R = new RuleSet("GiBlod.no");
R.rules.push(new Rule("^http://(?:www\\.)?giblod\\.no/", "https://www.giblod.no/"));
a("www.giblod.no");
a("giblod.no");

R = new RuleSet("GigaSize (partial)");
R.rules.push(new Rule("^http://(www\\.)?gigasize\\.com/", "https://$1gigasize.com/"));
a("gigasize.com");
a("*.gigasize.com");

R = new RuleSet("Gigaset.com");
R.rules.push(new Rule("^http://gigaset\\.com/", "https://gigaset.com/"));
R.rules.push(new Rule("^http://www\\.gigaset\\.com/", "https://gigaset.com/"));
a("gigaset.com");
a("www.gigaset.com");

R = new RuleSet("GitHub");
R.rules.push(new Rule("^http://(?:www\\.)?github\\.com/", "https://github.com/"));
R.rules.push(new Rule("^http://(assets\\d+|enterprise|gist|jobs|raw|status)\\.github\\.com/", "https://$1.github.com/"));
R.rules.push(new Rule("^http://cloud\\.github\\.com/", "https://s3.amazonaws.com/github/"));
R.rules.push(new Rule("^http://get\\.gaug\\.es/theme/.*/stylesheets/images/favicon\\.png$", "https://secure.guag.es/favicon.png"));
R.rules.push(new Rule("^http://secure\\.gaug\\.es/", "https://secure.gaug.es/"));
a("*.github.com");
a("github.com");
a("get.guag.es");
a("secure.gaug.es");

R = new RuleSet("Gitorious");
R.rules.push(new Rule("^http://gitorious\\.org/", "https://gitorious.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.gitorious\\.org/", "https://$1.gitorious.org/"));
R.exclusions.push(new Exclusion("^http://(blog|en|status)\\.gitorious\\.org/"));
a("gitorious.org");
a("*.gitorious.org");

R = new RuleSet("Give Kids the World");
R.rules.push(new Rule("^http://secure\\.gktw\\.org/", "https://secure.gktw.org/"));
R.rules.push(new Rule("^https?://(?:www\\.)?(?:gktw|givekidstheworld)\\.(com|org)/", "https://secure.gktw.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?givekidstheworldstore\\.org/", "https://www.givekidstheworldstore.org/"));
a("gktw.org");
a("www.gktw.org");
a("gktw.com");
a("www.gktw.com");
a("givekidstheworld.org");
a("www.givekidstheworld.org");
a("givekidstheworld.com");
a("www.givekidstheworld.com");
a("secure.gktw.org");
a("givekidstheworldstore.org");
a("www.givekidstheworldstore.org");

R = new RuleSet("Gizmag (partial)");
R.rules.push(new Rule("^http://images\\.gizmag\\.com/", "https://s3.amazonaws.com/gizmag-images/"));
R.rules.push(new Rule("^http://files\\.gizmag\\.com/", "https://s3.amazonaws.com/files.gizmag.com/"));
a("files.gizmag.com");
a("images.gizmag.com");

R = new RuleSet("GlenScott");
R.rules.push(new Rule("^http://(?:www\\.)?glenscott\\.net/", "https://www.glenscott.net/"));
a("glenscott.net");
a("www.glenscott.net");

R = new RuleSet("Global Investor Relations");
R.rules.push(new Rule("^http://(?:(www\\.)g-ir\\.com|ww7\\.investorrelations\\.co\\.uk)/", "https://ww7.investorrelations.co.uk/"));
a("g-ir.com");
a("www.g-ir.com");
a("ww7.investorrelations.co.uk");

R = new RuleSet("Global Marketing Strategies (partial)");
R.rules.push(new Rule("^http://(www\\.)?fanpagegeneratorpro\\.com/", "https://$1fanpagegeneratorpro.com/"));
R.rules.push(new Rule("^http://(www\\.)?(free|professional)privacypolicy\\.com/", "https://$1$2privacypolicy.com/"));
R.rules.push(new Rule("^http://(www\\.)?howtowriteabookasap\\.com/", "https://$1howtowriteabookasap.com/"));
R.rules.push(new Rule("^http://(fanpagegeneratorpro\\.|www\\.)?rhinosupport\\.com/", "https://$1rhinosupport.com/"));
R.rules.push(new Rule("^http://(www\\.)?shopperapproved\\.com/", "https://$1shopperapproved.com/"));
R.rules.push(new Rule("^http://(www\\.)?termsofservicegenerator\\.com/", "https://$1termsofservicegenerator.com/"));
R.rules.push(new Rule("^http://(secure\\.|www\\.)?trust-guard\\.com/", "https://$1trust-guard.com/"));
R.rules.push(new Rule("^http://seals\\.trust-guard\\.com/", "https://c674753.ssl.cf2.rackcdn.com/"));
R.rules.push(new Rule("^http://(www\\.)?whatsuccesstakes\\.com/", "https://$1whatsuccesstakes.com/"));
a("fanpagegeneratorpro.com");
a("www.fanpagegeneratorpro.com");
a("freeprivacypolicy.com");
a("www.freeprivacypolicy.com");
a("howtowriteabookasap.com");
a("www.howtowriteabookasap.com");
a("professionalprivacypolicy.com");
a("www.professionalprivacypolicy.com");
a("rhinosupport.com");
a("*.rhinosupport.com");
a("shopperapproved.com");
a("www.shopperapproved.com");
a("*.www.shopperapproved.com");
a("termsofservicegenerator.com");
a("www.termsofservicegenerator.com");
a("trust-guard.com");
a("*.trust-guard.com");
a("whatsuccesstakes.com");
a("www.whatsuccesstakes.com");

R = new RuleSet("GlobalSign");
R.rules.push(new Rule("^http://(?:www\\.)?globalsign\\.com/", "https://www.globalsign.com/"));
R.rules.push(new Rule("^http://(seal|ssif1)\\.globalsign\\.com/", "https://$1.globalsign.com/"));
a("globalsign.com");
a("www.globalsign.com");
a("seal.globalsign.com");
a("ssif1.globalsigncom");

R = new RuleSet("Globaltestsupply");
R.rules.push(new Rule("^http://(www\\.)?globaltestsupply\\.com/", "https://www.globaltestsupply.com/"));
a("www.globaltestsupply.com");
a("globaltestsupply.com");

R = new RuleSet("Global Scale Technologies");
R.rules.push(new Rule("^http://(?:www\\.)?globalscaletechnologies\\.com/", "https://www.globalscaletechnologies.com/"));
a("globalscaletechnologies.com");
a("www.globalscaletechnologies.com");

R = new RuleSet("TheGlobeAndMail");
R.rules.push(new Rule("^http://theglobeandmail\\.com/", "https://www.theglobeandmail.com/"));
R.rules.push(new Rule("^http://www\\.theglobeandmail\\.com/", "https://www.theglobeandmail.com/"));
a("www.theglobeandmail.com");
a("theglobeandmail.com");

R = new RuleSet("Glype (partial)");
R.rules.push(new Rule("^http://(www\\.)?glype\\.com/", "https://$1glype.com/"));
a("glype.com");
a("www.glype.com");

R = new RuleSet("GoDaddy");
R.rules.push(new Rule("^http://((certs|community|img|seal|shops|who|www)\\.)?godaddy\\.com/", "https://$1godaddy.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?godaddymobile\\.com/", "https://www.godaddymobile.com/"));
a("godaddy.com");
a("*.godaddy.com");
a("godaddymobile.com");
a("www.godaddymobile.com");

R = new RuleSet("GoingUp (partial)");
R.rules.push(new Rule("^http://goingup\\.com/", "https://www.goingup.com/"));
R.rules.push(new Rule("^http://(counter|www)\\.goingup\\.com/", "https://$1.goingup.com/"));
a("goingup.com");
a("*.goingup.com");

R = new RuleSet("Good.net");
R.rules.push(new Rule("^http://([^/]+)/", "https://$1/"));
a("good.net");
a("goodnet.com");
a("this-download-would-be-faster-with-a-premium-account-at-good.net");
a("*.good.net");
a("*.goodnet.com");
a("*.this-download-would-be-faster-with-a-premium-account-at-good.net");

R = new RuleSet("Goodreads (partial)");
R.rules.push(new Rule("^http://(www\\.)?goodreads\\.com/assets/", "https://$1goodreads.com/assets/"));
R.rules.push(new Rule("^http://photo\\.goodreads\\.com/", "https://s3.amazonaws.com/photo.goodreads.com/"));
a("goodreads.com");
a("*.goodreads.com");

R = new RuleSet("Google APIs");
R.rules.push(new Rule("^http://www\\.google-analytics\\.com/", "https://ssl.google-analytics.com/"));
R.rules.push(new Rule("^http://(ajax|chart|fonts|www)\\.googleapis\\.com/", "https://$1.googleapis.com/"));
R.rules.push(new Rule("^http://commondatastorage\\.googleapis\\.com/", "https://commondatastorage.googleapis.com/"));
R.rules.push(new Rule("^http://([^@:\\./]+)\\.commondatastorage\\.googleapis\\.com/", "https://$1.commondatastorage.googleapis.com/"));
R.rules.push(new Rule("^http://(?:www\\.|ssl\\.)?gstatic\\.com/", "https://ssl.gstatic.com/"));
R.rules.push(new Rule("^http://api\\.recaptcha\\.net/", "https://www.google.com/recaptcha/api/"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/recaptcha/", "https://www.google.com/recaptcha/"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/uds", "https://www.google.com/uds"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/chart", "https://www.google.com/chart"));
R.rules.push(new Rule("^http://apis\\.google\\.com/", "https://apis.google.com/"));
R.rules.push(new Rule("^http://chart\\.apis\\.google\\.com/chart", "https://chart.googleapis.com/chart"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/jsapi", "https://www.google.com/jsapi"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/afsonline/", "https://www.google.com/afsonline/"));
R.rules.push(new Rule("^http://gdata\\.youtube\\.com/", "https://gdata.youtube.com/"));
a("www.google-analytics.com");
a("ssl.google-analytics.com");
a("*.googleapis.com");
a("*.commondatastorage.googleapis.com");
a("google.com");
a("www.google.com");
a("apis.google.com");
a("*.apis.google.com");
a("gstatic.com");
a("*.gstatic.com");
a("api.recaptcha.net");
a("gdata.youtube.com");

R = new RuleSet("GoogleCanada");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.google\\.ca/finance", "https://$1.google.ca/finance"));
a("google.ca");
a("*.google.ca");

R = new RuleSet("Google Images");
R.rules.push(new Rule("^http://encrypted\\.google\\.com/(advanced_image_search|imghp)", "https://encrypted.google.com/$1"));
R.rules.push(new Rule("^https?://images\\.google\\.com/(images)?$", "https://encrypted.google.com/imghp"));
R.rules.push(new Rule("^http://(?:images\\.|www\\.)?google\\.com/(advanced_image_search|imghp)", "https://encrypted.google.com/$1"));
R.rules.push(new Rule("^https?://images\\.google\\.com/images\\?(.*q=)", "https://encrypted.google.com/search?tbm=isch&$1"));
R.rules.push(new Rule("^http://(?:images|www|encrypted)\\.google\\.com/(.*tbm=isch)", "https://encrypted.google.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:au|ca|gh|ie|in|jm|ke|lk|my|na|ng|nz|pk|rw|sl|sg|ug|uk|za|zw)/(advanced_image_search|imghp)", "https://encrypted.google.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:ar|bo|cl|co|cu|cr|ec|es|gt|mx|pa|pe|py|sv|uy|ve)/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=es"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com\\.)?(?:ae|bh|eg|jo|kw|lb|ly|om|qa|sa)/(advanced_image_search|imghp)$", "https://encrypted.google.com/imghp?hl=ar"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:at|ch|de)/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=de"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(fr|nl|it|pl|ru|bg|pt|ro|hr|fi|no)/(advanced_image_search|imghp)$", "https://encrypted.google.com/$2?hl=$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com?\\.(id|th|tr)/(advanced_image_search|imghp)$", "https://encrypted.google.com/$2?hl=$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.il/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=he"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kr/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=ko"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kz/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=kk"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.jp/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=ja"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.vn/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=vi"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.br/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=pt-BR"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.se/(advanced_image_search|imghp)$", "https://encrypted.google.com/$1?hl=sv"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:ar|bo|cl|co|cu|cr|ec|es|gt|mx|pa|pe|py|sv|uy|ve)/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=es&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com\\.)?(?:ae|bh|eg|jo|kw|lb|ly|om|qa|sa)/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=ar&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:at|ch|de)/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=de&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(fr|nl|it|pl|ru|bg|pt|ro|hr|fi|no)/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$2?hl=$1&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com?\\.(id|th|tr)/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$2?hl=$1&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.il/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=he&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kr/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=ko&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kz/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=kk&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.jp/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=ja&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.vn/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=vi&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.br/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=pt-BR&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.se/(advanced_image_search|imghp)\\?", "https://encrypted.google.com/$1?hl=sv&"));
a("*.google.com");
a("google.com");
a("www.google.com.*");
a("google.com.*");
a("www.google.co.*");
a("google.co.*");
a("www.google.*");
a("google.*");

R = new RuleSet("GoogleMaps");
R.rules.push(new Rule("^http://maps\\.(google|gstatic|googleapis)\\.com/", "https://maps.$1.com/"));
R.rules.push(new Rule("^http://maps\\.google\\.([^/]+)/", "https://maps.google.$1/"));
R.rules.push(new Rule("^http://maps-api-ssl\\.google\\.com/", "https://maps-api-ssl.google.com/"));
a("maps.google.com");
a("maps.gstatic.com");
a("maps-api-ssl.google.com");
a("maps.googleapis.com");
a("maps.google.*");
a("maps.google.com.*");
a("maps.google.co.*");

R = new RuleSet("GoogleMelange");
R.rules.push(new Rule("^http://(www\\.)?google-melange\\.com/", "https://www.google-melange.com/"));
a("www.google-melange.com");
a("google-melange.com");

R = new RuleSet("Google Search");
R.rules.push(new Rule("^http://encrypted\\.google\\.com/", "https://encrypted.google.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/search", "https://encrypted.google.com/search"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/about", "https://www.google.com/about"));
R.rules.push(new Rule("^http://(?:www\\.)?google(?:\\.com?)?\\.[a-z][a-z]/firefox/?$", "https://encrypted.google.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?google(?:\\.com?)?\\.[a-z][a-z]/firefox", "https://encrypted.google.com/webhp"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/webhp", "https://encrypted.google.com/webhp"));
R.rules.push(new Rule("^http://codesearch\\.google\\.com/", "https://codesearch.google.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/codesearch", "https://www.google.com/codesearch"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/#", "https://encrypted.google.com/#"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/$", "https://encrypted.google.com/"));
R.rules.push(new Rule("^http://ipv6\\.google\\.com/", "https://ipv6.google.com/"));
R.rules.push(new Rule("^http://(www\\.)?google(\\.com?)?\\.([a-z][a-z])/(search\\?|#)", "https://$1google$2.$3/$4"));
R.rules.push(new Rule("^http://(www\\.)?google(\\.com?)?\\.([a-z][a-z])/setprefs", "https://$1google$2.$3/setprefs"));
R.rules.push(new Rule("^http://clients[0-9]\\.google\\.com/complete/search", "https://clients1.google.com/complete/search"));
R.rules.push(new Rule("^http://clients[0-9]\\.google(\\.com?\\.[a-z][a-z])/complete/search", "https://clients1.google.$1/complete/search"));
R.rules.push(new Rule("^http://clients[0-9]\\.google\\.([a-z][a-z])/complete/search", "https://clients1.google.$1/complete/search"));
R.rules.push(new Rule("^http://suggestqueries\\.google\\.com/complete/search", "https://clients1.google.com/complete/search"));
R.rules.push(new Rule("^http://(www\\.)?google\\.(com?\\.)?([a-z][a-z])/(webhp)?$", "https://$1google.$2$3/"));
R.rules.push(new Rule("^http://(www\\.)?google\\.(com?\\.)?([a-z][a-z])/(?:webhp)?\\?", "https://$1google.$2$3/webhp?"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?google\\.com/search.*tbs=shop"));
R.exclusions.push(new Exclusion("^http://clients[0-9]\\.google\\.com/.*client=products.*"));
R.exclusions.push(new Exclusion("^http://suggestqueries\\.google\\.com/.*client=.*"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?google\\.com/search.*tbm=isch.*"));
a("*.google.com");
a("google.com");
a("www.google.com.*");
a("google.com.*");
a("www.google.co.*");
a("google.co.*");
a("www.google.*");
a("google.*");
a("clients1.google.com.*");
a("clients2.google.com.*");
a("clients3.google.com.*");
a("clients4.google.com.*");
a("clients5.google.com.*");
a("clients6.google.com.*");
a("clients1.google.co.*");
a("clients2.google.co.*");
a("clients3.google.co.*");
a("clients4.google.co.*");
a("clients5.google.co.*");
a("clients6.google.co.*");
a("clients1.google.*");
a("clients2.google.*");
a("clients3.google.*");
a("clients4.google.*");
a("clients5.google.*");
a("clients6.google.*");

R = new RuleSet("Google Services");
R.rules.push(new Rule("^http://(?:www\\.)?admeld\\.com/images/interface/masthead_bk\\.jpg$", "https://portal.admeld.com/images/bg.jpg"));
R.rules.push(new Rule("^http://portal\\.admeld\\.com/", "https://portal.admeld.com/"));
R.rules.push(new Rule("^http://lh6\\.ggpht\\.com/", "https://lh6.ggpht.com/"));
R.rules.push(new Rule("^http://(accounts|adwords|appengine|calendar|checkout|chrome|code|docs\\d?|drive|feedburner|groups|health|hostedtalkgadget|investor|mail|pack|picasaweb|plus|plusone|profiles|sites|spreadsheets\\d?|support|talkgadget|talk|tools)\\.google\\.com/", "https://$1.google.com/"));
R.rules.push(new Rule("^http://groups\\.google\\.de/", "https://groups.google.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?g(?:oogle)?mail\\.com/", "https://mail.google.com/"));
R.rules.push(new Rule("^http://(?:encrypted-)?tbn2\\.google\\.com/", "https://encrypted-tbn2.google.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?google((\\.com?)?(\\.[^/@:][^/@:])?)/profiles", "https://www.google$1/profiles"));
R.rules.push(new Rule("^http://news\\.google(?:\\.com?)?(?:\\.[^/@:][^/@:])?/news", "https://www.google.com/news"));
R.rules.push(new Rule("^http://news\\.google(?:\\.com?)?(?:\\.[^/@:][^/@:])?/newshp", "https://www.google.com/news"));
R.rules.push(new Rule("^http://news\\.google(?:\\.com?)?(?:\\.[^/@:][^/@:])?/$", "https://www.google.com/news"));
R.rules.push(new Rule("^http://(?:www\\.)?googlecode\\.com/$", "https://code.google.com/"));
R.rules.push(new Rule("^http://([^/:@]+)\\.googlecode\\.com/$", "https://code.google.com/p/$1/"));
R.rules.push(new Rule("^http://([^/:@]+)\\.googlecode\\.com/(.+)", "https://$1.googlecode.com/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/finance", "https://www.google.com/finance"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.co\\.uk/finance", "https://www.google.co.uk/finance"));
R.rules.push(new Rule("^https?://finance\\.google\\.com/", "https://www.google.com/finance/"));
R.rules.push(new Rule("^https?://finance\\.google\\.co\\.uk/", "https://www.google.co.uk/finance/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.google\\.ca/finance", "https://$1.google.ca/finance"));
R.rules.push(new Rule("^http://trends\\.google\\.com/", "https://www.google.com/trends"));
R.rules.push(new Rule("^http://([^@:\\./]+\\.)?appspot\\.com/", "https://$1appspot.com/"));
R.rules.push(new Rule("^http://([^\\./]\\.)?googlesoure\\.com/", "https://$1googlesource.com/"));
R.rules.push(new Rule("^http://pagead2\\.googlesyndication\\.com/", "https://pagead2.googlesyndication.com/"));
R.rules.push(new Rule("^http://partner\\.googleadservices\\.com/", "https://partner.googleadservices.com/"));
R.rules.push(new Rule("^http://googleusercontent\\.com/", "https://www.googleusercontent.com/"));
R.rules.push(new Rule("^http://([^@:\\./]+)\\.googleusercontent\\.com/", "https://$1.googleusercontent.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(ca|co\\.in|co\\.uk)/(contacts|prdhp|products|shopping)", "https://www.google.$1/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?google(?:\\.com?)?(?:\\.[^/@:][^/@:])?/(adplanner|ads|css|images|intl|js|logos|tools|googleblogs|s2|support|transparencyreport)/", "https://www.google.com/$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?google(?:\\.com?)?(?:\\.[^/@:][^/@:])?/(calendar|dictionary|trends|url)", "https://www.google.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google(?:\\.com?)?(?:\\.[^/@:][^/@:])?/(?:cse|custom)", "https://www.google.com/cse"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/(\\+|accounts|extern_js|moderator|newproducts|nexus|phone|reader|videotargeting)/", "https://www.google.com/$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/(buzz|contacts|favicon\\.ico|insights|news|prdhp|products|shopping|webfonts)", "https://www.google.com/$1"));
R.rules.push(new Rule("^http://s(afebrowsing-cache|b-ssl)\\.google\\.com/", "https://s$1.google.com/"));
R.exclusions.push(new Exclusion("^http://photomunchers\\.appspot\\.com/"));
R.exclusions.push(new Exclusion("^http://(news\\.)?google\\.com/newspapers"));
R.exclusions.push(new Exclusion("^http://(news\\.)?google\\.com/archivesearch"));
a("admeld.com");
a("*.admeld.com");
a("lh6.ggpht.com");
a("google.*");
a("google.com");
a("*.google.com");
a("google.co.*");
a("google.com.*");
a("www.google.*");
a("www.google.co.*");
a("www.google.com.*");
a("groups.google.de");
a("gmail.com");
a("www.gmail.com");
a("googlemail.com");
a("www.googlemail.com");
a("googlecode.com");
a("*.googlecode.com");
a("news.google.co.*");
a("news.google.com.*");
a("news.google.*");
a("appspot.com");
a("*.appspot.com");
a("googlesource.com");
a("*.googlesource.com");
a("pagead2.googlesyndication.com");
a("partner.googleadservices.com");
a("googleusercontent.com");
a("*.googleusercontent.com");

R = new RuleSet("Google Shopping");
R.rules.push(new Rule("^http://encrypted\\.google\\.com/(prdhp|shopping)", "https://www.google.com/$1"));
R.rules.push(new Rule("^https?://shopping\\.google\\.com/", "https://www.google.com/shopping"));
R.rules.push(new Rule("^http://(www\\.)?google\\.com/prdhp", "https://www.google.com/prdhp"));
R.rules.push(new Rule("^http://(?:www|encrypted)\\.google\\.com/(.*tbm=shop)", "https://www.google.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:au|ca|gh|ie|in|jm|ke|lk|my|na|ng|nz|pk|rw|sl|sg|ug|uk|za|zw)/(prdhp|shopping)", "https://www.google.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:ar|bo|cl|co|cu|cr|ec|es|gt|mx|pa|pe|py|sv|uy|ve)/(prdhp|shopping)$", "https://www.google.com/$1?hl=es"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com\\.)?(?:ae|bh|eg|jo|kw|lb|ly|om|qa|sa)/(prdhp|shopping)$", "https://www.google.com/$1?hl=ar"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:at|ch|de)/(prdhp|shopping)$", "https://www.google.com/$1?hl=de"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(fr|nl|it|pl|ru|bg|pt|ro|hr|fi|no)/(prdhp|shopping)$", "https://www.google.com/$2?hl=$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com?\\.(id|th|tr)/(prdhp|shopping)$", "https://www.google.com/$2?hl=$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.il/(prdhp|shopping)$", "https://www.google.com/$1?hl=he"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kr/(prdhp|shopping)$", "https://www.google.com/$1?hl=ko"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kz/(prdhp|shopping)$", "https://www.google.com/$1?hl=kk"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.jp/(prdhp|shopping)$", "https://www.google.com/$1?hl=ja"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.vn/(prdhp|shopping)$", "https://www.google.com/$1?hl=vi"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.br/(prdhp|shopping)$", "https://www.google.com/$1?hl=pt-BR"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.se/(prdhp|shopping)$", "https://www.google.com/$1?hl=sv"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:ar|bo|cl|co|cu|cr|ec|es|gt|mx|pa|pe|py|sv|uy|ve)/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=es&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com\\.)?(?:ae|bh|eg|jo|kw|lb|ly|om|qa|sa)/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=ar&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:at|ch|de)/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=de&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(fr|nl|it|pl|ru|bg|pt|ro|hr|fi|no)/(prdhp|shopping)\\?", "https://www.google.com/$2?hl=$1&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com?\\.(id|th|tr)/(prdhp|shopping)\\?", "https://www.google.com/$2?hl=$1&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.il/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=he&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kr/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=ko&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kz/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=kk&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.jp/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=ja&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.vn/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=vi&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.br/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=pt-BR&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.se/(prdhp|shopping)\\?", "https://www.google.com/$1?hl=sv&"));
a("*.google.com");
a("google.com");
a("www.google.com.*");
a("google.com.*");
a("www.google.co.*");
a("google.co.*");
a("www.google.*");
a("google.*");

R = new RuleSet("GoogleSorry");
R.rules.push(new Rule("^http://((sorry|www)\\.)?google\\.com/sorry/", "https://sorry.google.com/sorry/"));
a("sorry.google.com");
a("www.google.com");
a("google.com");

R = new RuleSet("Google Translate");
R.rules.push(new Rule("^http://translate\\.googleapis\\.com/", "https://translate.googleapis.com/"));
R.rules.push(new Rule("^http://translate\\.google\\.com/translate_a/element\\.js", "https://translate.google.com/translate_a/element.js"));
a("translate.googleapis.com");
a("translate.google.com");

R = new RuleSet("Google Videos");
R.rules.push(new Rule("^http://encrypted\\.google\\.com/videohp", "https://encrypted.google.com/videohp"));
R.rules.push(new Rule("^https?://videos?\\.google\\.com/$", "https://encrypted.google.com/videohp"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com/videohp", "https://encrypted.google.com/videohp"));
R.rules.push(new Rule("^http://(?:images|www|encrypted)\\.google\\.com/(.*tbm=isch)", "https://encrypted.google.com/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:au|ca|gh|ie|in|jm|ke|lk|my|na|ng|nz|pk|rw|sl|sg|ug|uk|za|zw)/videohp", "https://encrypted.google.com/videohp"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:ar|bo|cl|co|cu|cr|ec|es|gt|mx|pa|pe|py|sv|uy|ve)/videohp$", "https://encrypted.google.com/videohp?hl=es"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com\\.)?(?:ae|bh|eg|jo|kw|lb|ly|om|qa|sa)/videohp$", "https://encrypted.google.com/videohp?hl=ar"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:at|ch|de)/videohp$", "https://encrypted.google.com/videohp?hl=de"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(fr|nl|it|pl|ru|bg|pt|ro|hr|fi|no)/videohp$", "https://encrypted.google.com/videohp?hl=$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com?\\.(id|th|tr)/videohp$", "https://encrypted.google.com/videohp?hl=$1"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.il/videohp$", "https://encrypted.google.com/videohp?hl=he"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kr/videohp$", "https://encrypted.google.com/videohp?hl=ko"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kz/videohp$", "https://encrypted.google.com/videohp?hl=kk"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.jp/videohp$", "https://encrypted.google.com/videohp?hl=ja"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.vn/videohp$", "https://encrypted.google.com/videohp?hl=vi"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.br/videohp$", "https://encrypted.google.com/videohp?hl=pt-BR"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.se/videohp$", "https://encrypted.google.com/videohp?hl=sv"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com?\\.)?(?:ar|bo|cl|co|cu|cr|ec|es|gt|mx|pa|pe|py|sv|uy|ve)/videohp\\?", "https://encrypted.google.com/videohp?hl=es&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:com\\.)?(?:ae|bh|eg|jo|kw|lb|ly|om|qa|sa)/videohp\\?", "https://encrypted.google.com/videohp?hl=ar&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(?:at|ch|de)/videohp\\?", "https://encrypted.google.com/videohp?hl=de&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.(fr|nl|it|pl|ru|bg|pt|ro|hr|fi|no)/videohp\\?", "https://encrypted.google.com/videohp?hl=$1&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com?\\.(id|th|tr)/videohp\\?", "https://encrypted.google.com/videohp?hl=$1&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.il/videohp\\?", "https://encrypted.google.com/videohp?hl=he&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kr/videohp\\?", "https://encrypted.google.com/videohp?hl=ko&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.kz/videohp\\?", "https://encrypted.google.com/videohp?hl=kk&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.jp/videohp\\?", "https://encrypted.google.com/videohp?hl=ja&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.vn/videohp\\?", "https://encrypted.google.com/videohp?hl=vi&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.com\\.br/videohp\\?", "https://encrypted.google.com/videohp?hl=pt-BR&"));
R.rules.push(new Rule("^http://(?:www\\.)?google\\.se/videohp\\?", "https://encrypted.google.com/videohp?hl=sv&"));
a("*.google.com");
a("google.com");
a("www.google.com.*");
a("google.com.*");
a("www.google.co.*");
a("google.co.*");
a("www.google.*");
a("google.*");

R = new RuleSet("GovDelivery (partial)");
R.rules.push(new Rule("^http://(public|service)\\.govdelivery\\.com/", "https://$1.govdelivery.com/"));
R.exclusions.push(new Exclusion("^http://(direct|www)\\."));
a("*.govdelivery.com");

R = new RuleSet("Governo Português");
R.rules.push(new Rule("^http://portaldocidadao\\.pt/", "https://www.portaldocidadao.pt/"));
R.rules.push(new Rule("^http://www\\.portaldocidadao\\.pt/", "https://www.portaldocidadao.pt/"));
R.rules.push(new Rule("^http://portaldaempresa\\.pt/", "https://www.portaldaempresa.pt/"));
R.rules.push(new Rule("^http://www\\.portaldaempresa\\.pt/", "https://www.portaldaempresa.pt/"));
R.rules.push(new Rule("^http://portugal\\.gov\\.pt/", "https://www.portugal.gov.pt/"));
R.rules.push(new Rule("^http://www\\.portugal\\.gov\\.pt/", "https://www.portugal.gov.pt/"));
R.exclusions.push(new Exclusion("^http://www\\.portugal\\.gov\\.pt/PortalMovel/"));
a("www.portugal.gov.pt");
a("portugal.gov.pt");
a("portaldocidadao.pt");
a("www.portaldocidadao.pt");
a("portaldaempresa.pt");
a("www.portaldaempresa.pt");

R = new RuleSet("Gowalla");
R.rules.push(new Rule("^http://(?:www\\.)?gowalla\\.com/", "https://gowalla.com/"));
R.rules.push(new Rule("^http://static\\.gowalla\\.com/", "https://s3.amazonaws.com/static.gowalla.com/"));
a("gowalla.com");
a("www.gowalla.com");
a("static.gowalla.com");

R = new RuleSet("graasmilk.net");
R.rules.push(new Rule("^http://(www\\.)?(webmail\\.)?graasmilk\\.net/", "https://$2graasmilk.net/"));
a("graasmilk.net");
a("webmail.graasmilk.net");
a("www.graasmilk.net");

R = new RuleSet("Gravatar");
R.rules.push(new Rule("^http://(?:(?:www|en|s|secure|0|1|2)\\.)?gravatar\\.com/", "https://secure.gravatar.com/"));
a("gravatar.com");
a("*.gravatar.com");

R = new RuleSet("Gravity (partial)");
R.rules.push(new Rule("^http://gravity\\.com/", "https://www.gravity.com/"));
R.rules.push(new Rule("^http://(insights|www)\\.gravity\\.com/", "https://$1.gravity.com/"));
R.rules.push(new Rule("^http://i\\.grvcdn\\.com/gravity\\.com/", "https://www.gravity.com/"));
a("gravity.com");
a("*.gravity.com");
a("i.grvcdn.com");

R = new RuleSet("GreenIT-BB (partial)");
R.rules.push(new Rule("^http://benchmarking\\.greenit-bb\\.de/", "https://benchmarking.greenit-bb.de/"));
a("benchmarking.greenit-bb.de");

R = new RuleSet("Greentech Media");
R.rules.push(new Rule("^http://(www\\.)?greentechmedia\\.com/", "https://$1greentechmedia.com/"));
a("greentechmedia.com");
a("www.greentechmedia.com");

R = new RuleSet("Greplin.com");
R.rules.push(new Rule("^http://(www\\.)?greplin\\.com/", "https://www.greplin.com/"));
a("greplin.com");
a("www.greplin.com");

R = new RuleSet("Grepular");
R.rules.push(new Rule("^http://(?:www\\.|secure\\.)?grepular\\.com/", "https://grepular.com/"));
a("www.grepular.com");
a("secure.grepular.com");
a("grepular.com");

R = new RuleSet("Groton.org");
R.rules.push(new Rule("^http://www\\.groton\\.org/", "https://www.groton.org/"));
R.rules.push(new Rule("^http://groton\\.org/", "https://www.groton.org/"));
a("www.groton.org");
a("groton.org");

R = new RuleSet("Group Commerce (partial)");
R.rules.push(new Rule("^http://admin\\.groupcommerce\\.com/", "https://admin.groupcommerce.com/"));
a("admin.groupcommerce.com");

R = new RuleSet("GroupLogic (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?grouplogic\\.com/", "https://www.grouplogic.com/"));
a("grouplogic.com");
a("www.grouplogic.com");

R = new RuleSet("Groupon.se");
R.rules.push(new Rule("^http://groupon\\.se/", "https://www.groupon.se/"));
R.rules.push(new Rule("^http://www\\.groupon\\.se/", "https://www.groupon.se/"));
a("groupon.se");

R = new RuleSet("Groupon DE/UK");
R.rules.push(new Rule("^http://groupon\\.(de|co\\.uk)/", "https://www.groupon.$1/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.groupon\\.(de|co\\.uk)/", "https://$1.groupon.$2/"));
R.exclusions.push(new Exclusion("^http://(news|jobs|blog)\\.groupon\\.co\\.uk/"));
R.exclusions.push(new Exclusion("^http://action\\.groupon\\.de/"));
a("groupon.de");
a("*.groupon.de");
a("groupon.co.uk");
a("*.groupon.co.uk");

R = new RuleSet("Grupfoni");
R.rules.push(new Rule("^http://images\\.grupfoni\\.com/", "https://images.grupfoni.com/"));
R.rules.push(new Rule("^http://(www\\.)?grupfoni\\.com/", "https://www.grupfoni.com/"));
a("www.grupfoni.com");
a("grupfoni.com");
a("images.grupfoni.com");

R = new RuleSet("Gsfacket.se");
R.rules.push(new Rule("^http://gsfacket\\.se/", "https://www.gsfacket.se/"));
R.rules.push(new Rule("^http://www\\.gsfacket\\.se/", "https://www.gsfacket.se/"));
a("gsfacket.se");
a("www.gsfacket.se");

R = new RuleSet("The Guardian (partial)");
R.rules.push(new Rule("^http://www\\.guardian\\.co\\.uk/favicon\\.ico", "https://image.guim.co.uk/favicon.ico"));
R.rules.push(new Rule("^http://guardianbookshop\\.co\\.uk/", "https://www.guardianbookshop.co.uk/"));
R.rules.push(new Rule("^http://www\\.guardianbookshop\\.co\\.uk/(BerteShopWeb|images)/", "https://www.guardianbookshop.co.uk/$1/"));
R.rules.push(new Rule("^http://(www\\.)?guardianeatright\\.co\\.uk/", "https://$1guardianeatright.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?(?:image|static)\\.gu(?:ardian|im)\\.co\\.uk/", "https://image.guim.co.uk/"));
R.rules.push(new Rule("^http://soulmates\\.guardian\\.co\\.uk/", "https://soulmates.guardian.co.uk/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?(combo|hits|resource)\\."));
a("*.guardian.co.uk");
a("www.*.guardian.co.uk");
a("guardianbookshop.co.uk");
a("www.guardianbookshop.co.uk");
a("guardianeatright.co.uk");
a("www.guardianeatright.co.uk");
a("*.guim.co.uk");
a("www.*.guim.co.uk");

R = new RuleSet("Guardian Project");
R.rules.push(new Rule("^http://(?:www\\.)?guardianproject\\.info/", "https://guardianproject.info/"));
a("guardianproject.info");
a("www.guardianproject.info");

R = new RuleSet("GuideStar (partial)");
R.rules.push(new Rule("^http://(?:www2?\\.)?guidestar\\.org/", "https://www.guidestar.org/"));
R.rules.push(new Rule("^http://commerce\\.guidestar\\.org/", "https://commerce.guidestar.org/"));
a("guidestar.org");
a("commerce.guidestar.org");
a("www.guidestar.org");
a("www2.guidestar.org");

R = new RuleSet("Guifi.net");
R.rules.push(new Rule("^http://(?:www\\.)?guifi\\.net/", "https://guifi.net/"));
a("guifi.net");
a("www.guifi.net");

R = new RuleSet("Gulesider");
R.rules.push(new Rule("^http://(?:www\\.)?gulesider\\.no/", "https://www.gulesider.no/"));
R.exclusions.push(new Exclusion("^http://kundesider\\.gulesider\\.no/"));
a("gulesider.no");
a("www.gulesider.no");

R = new RuleSet("GunIO");
R.rules.push(new Rule("^http://(www\\.)?gun\\.io/", "https://$1gun.io/"));
a("gun.io");
a("www.gun.io");

R = new RuleSet("Gynecomastia.org");
R.rules.push(new Rule("^http://(www\\.)?gynecomastia\\.org/", "https://www.gynecomastia.org/"));
a("gynecomastia.org");
a("www.gynecomastia.org");

R = new RuleSet("HD.se");
R.rules.push(new Rule("^http://hd\\.se/", "https://hd.se/"));
R.rules.push(new Rule("^http://www\\.hd\\.se/", "https://hd.se/"));
a("hd.se");
a("*.hd.se");

R = new RuleSet("Huntington's Disease Society of America");
R.rules.push(new Rule("^https?://hdsa\\.org/", "https://www.hdsa.org/"));
R.rules.push(new Rule("^http://www\\.hdsa\\.org/", "https://www.hdsa.org/"));
a("hdsa.org");
a("www.hdsa.org");

R = new RuleSet("HGO.se");
R.rules.push(new Rule("^http://hgo\\.se/", "https://www.hgo.se/"));
R.rules.push(new Rule("^http://www\\.hgo\\.se/", "https://www.hgo.se/"));
R.rules.push(new Rule("^http://space\\.hgo\\.se/", "https://space.hgo.se/"));
a("www.hgo.se");
a("hgo.se");
a("space.hgo.se");

R = new RuleSet("HH.se");
R.rules.push(new Rule("^http://hh\\.se/", "https://www.hh.se/"));
R.rules.push(new Rule("^http://www\\.hh\\.se/", "https://www.hh.se/"));
a("www.hh.se");
a("hh.se");

R = new RuleSet("HIG.se");
R.rules.push(new Rule("^http://hig\\.se/", "https://www.hig.se/"));
R.rules.push(new Rule("^http://www\\.hig\\.se/", "https://www.hig.se/"));
a("www.hig.se");
a("hig.se");

R = new RuleSet("HIS.se");
R.rules.push(new Rule("^http://his\\.se/", "https://www.his.se/"));
R.rules.push(new Rule("^http://www\\.his\\.se/", "https://www.his.se/"));
a("www.his.se");
a("his.se");

R = new RuleSet("HKK");
R.rules.push(new Rule("^http://(?:www\\.)?hkk\\.de/", "https://www.hkk.de/"));
a("www.hkk.de");
a("hkk.de");

R = new RuleSet("Hm.com");
R.rules.push(new Rule("^http://www\\.hm\\.com/", "https://www.hm.com/"));
R.rules.push(new Rule("^http://hm\\.com/", "https://www.hm.com/"));
a("www.hm.com");
a("hm.com");

R = new RuleSet("HMV");
R.rules.push(new Rule("^http://hmv\\.com/", "https://hmv.com/"));
R.rules.push(new Rule("^http://www\\.hmv\\.com/", "https://hmv.com/"));
R.rules.push(new Rule("^http://hmv\\.co\\.uk/", "https://hmv.com/"));
R.rules.push(new Rule("^http://www\\.hmv\\.co\\.uk/", "https://hmv.com/"));
R.rules.push(new Rule("^http://www3\\.hmv\\.co\\.uk/", "https://www3.hmv.co.uk/"));
a("www.hmv.com");
a("hmv.com");
a("hmv.co.uk");
a("www.hmv.co.uk");
a("www3.hmv.co.uk");

R = new RuleSet("HSBC");
R.rules.push(new Rule("^http://(?:www\\.)?hsbc\\.(com|co\\.uk|com\\.ar|am|com\\.au|com\\.bh|com\\.bd|bm|com\\.br|com\\.bn|ca|ky|com\\.cn|com\\.co|com\\.eg|fr|gr|com\\.hk|co\\.in|co\\.jp|kz|jo|co\\.kr|com\\.lb|com\\.mo|com\\.my|com\\.mt|co\\.mu|com\\.mx|co\\.om|com\\.pk|com\\.py|com\\.ph|pl|com\\.qa|ru|com\\.sg|lk|com\\.tw|co\\.th|ae|com\\.vn)/", "https://www.hsbc.$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?hsbctrinkaus\\.de/", "https://www.hsbctrinkaus.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?sabb\\.com/", "https://www.sabb.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?firstdirect\\.com/", "https://www.firstdirect.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?us\\.hsbc\\.com/", "https://www.us.hsbc.com/"));
a("hsbc.*");
a("www.hsbc.*");
a("hsbc.co.*");
a("www.hsbc.co.*");
a("hsbc.com.*");
a("www.hsbc.com.*");
a("*.hsbctrinkaus.de");
a("hsbctrinkaus.de");
a("*.sabb.com");
a("sabb.com");
a("*.firstdirect.com");
a("firstdirect.com");
a("*.us.hsbc.com");
a("us.hsbc.com");

R = new RuleSet("Home School Legal Defense Association");
R.rules.push(new Rule("^http://(?:www\\.)?hslda\\.org/", "https://www.hslda.org/"));
R.rules.push(new Rule("^http://secure\\.hslda\\.org/", "https://secure.hslda.org/"));
a("hslda.org");
a("www.hslda.org");
a("secure.hslda.org");

R = new RuleSet("HSV.se");
R.rules.push(new Rule("^http://hsv\\.se/", "https://www.hsv.se/"));
R.rules.push(new Rule("^http://www\\.hsv\\.se/", "https://www.hsv.se/"));
a("www.hsv.se");
a("hsv.se");

R = new RuleSet("HTTPwatch.com");
R.rules.push(new Rule("^http://httpwatch\\.com/", "https://www.httpwatch.com/"));
R.rules.push(new Rule("^http://(blog|www)\\.httpwatch\\.com/", "https://$1.httpwatch.com/"));
a("httpwatch.com");
a("*.httpwatch.com");

R = new RuleSet("HUK Coburg");
R.rules.push(new Rule("^http://(?:www\\.)?huk\\.de/", "https://www.huk.de/"));
a("www.huk.de");
a("huk.de");

R = new RuleSet("Haber Vision (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?habervision\\.com/(css/|images/|mainstreet/)", "https://www.habervision.com/$1"));
a("habervision.com");
a("www.habervision.com");

R = new RuleSet("HackerNews");
R.rules.push(new Rule("^http://(?:www\\.)?news\\.ycombinator\\.com/", "https://news.ycombinator.com/"));
a("news.ycombinator.com");
a("www.news.ycombinator.com");

R = new RuleSet("hackerschool.com");
R.rules.push(new Rule("^http://hackerschool\\.com/", "https://www.hackerschool.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.hackerschool\\.com/", "https://$1.hackerschool.com/"));
a("hackerschool.com");
a("*.hackerschool.com");

R = new RuleSet("Hackinthebox.org");
R.rules.push(new Rule("^http://forum\\.hackinthebox\\.org/", "https://forum.hackinthebox.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?hackinthebox\\.org/", "https://www.hackinthebox.org/"));
a("hackinthebox.org");
a("www.hackinthebox.org");
a("forum.hackinthebox.org");

R = new RuleSet("Hakko.com");
R.rules.push(new Rule("^http://(?:www\\.)?hakko\\.com/", "https://www.hakko.com/"));
a("www.hakko.com");
a("hakko.com");

R = new RuleSet("Halebop.se");
R.rules.push(new Rule("^http://halebop\\.se/", "https://www.halebop.se/"));
R.rules.push(new Rule("^http://www\\.halebop\\.se/", "https://www.halebop.se/"));
a("halebop.se");
a("www.halebop.se");

R = new RuleSet("Halifax");
R.rules.push(new Rule("^http://(?:www\\.)?halifax\\.co\\.uk/", "https://www.halifax.co.uk/"));
a("halifax.co.uk");
a("www.halifax.co.uk");

R = new RuleSet("Hamburg");
R.rules.push(new Rule("^http://(?:www\\.)?hamburg\\.de/", "https://www.hamburg.de/"));
a("www.hamburg.de");
a("hamburg.de");

R = new RuleSet("Hamppu.net");
R.rules.push(new Rule("^http://(?:www\\.)?hamppu\\.net/", "https://hamppu.net/"));
a("hamppu.net");
a("www.hamppu.net");

R = new RuleSet("Handbrake.fr");
R.rules.push(new Rule("^http://(?:www\\.)?handbrake\\.fr/", "https://handbrake.fr/"));
a("handbrake.fr");
a("www.handbrake.fr");

R = new RuleSet("Harland Clarke");
R.rules.push(new Rule("^(http://(www\\.)?|(https://))checksconnect\\.com/", "https://www.checksconnect.com/"));
R.rules.push(new Rule("^http://member\\.harland\\.com/", "https://member.harland.com/"));
R.rules.push(new Rule("^https?://(www\\.)?harland\\.(com|net)/?$", "https://www.ordermychecks.com/"));
R.rules.push(new Rule("^http://(branchprod|vansso)\\.harland\\.net/", "https://$1.harland.net/"));
R.rules.push(new Rule("^(http://(www\\.)?|(https://))(harlandclarke(giftcard|websmart)?|harlandforms|ordermychecks)\\.com/", "https://www.$4.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?harlandclarke\\.com/businessshop($|/)"));
R.exclusions.push(new Exclusion("^http://(www\\.)?harlandclarke\\.com/bdocs2($|/)"));
a("checksconnect.com");
a("www.checksconnect.com");
a("harland.com");
a("member.harland.com");
a("www.harland.com");
a("harland.net");
a("branchprod.harland.net");
a("vansso.harland.net");
a("www.harland.net");
a("harlandforms.com");
a("www.harlandforms.com");
a("harlandclarke.com");
a("www.harlandclarke.com");
a("harlandclarkegiftcard.com");
a("www.harlandclarkegiftcard.com");
a("harlandclarkewebsmart.com");
a("www.harlandclarkewebsmart.com");
a("ordermychecks.com");
a("www.ordermychecks.com");

R = new RuleSet("Harman International Industries (partial)");
R.rules.push(new Rule("^http://(?:\\w+\\.(?:akg|infinitysystems)\\.com|(?:www\\.)?shop\\.harman\\.com|(?:www\\.)?harmankardon\\.nl)/(plugins|system|tl_files)/", "https://shop.harman.com/$1/"));
R.exclusions.push(new Exclusion("http://www\\.akg\\."));
a("*.akg.com");
a("shop.harman.com");
a("www.shop.harman.com");
a("karmankardon.nl");
a("www.karmankardon.nl");
a("*.infinitysystems.com");

R = new RuleSet("Harris Interactive (partial)");
R.rules.push(new Rule("^http://www1\\.pollg\\.com/", "https://www1.pollg.com/"));
a("www1.pollg.com");

R = new RuleSet("Hawaiian Airlines");
R.rules.push(new Rule("^http://hawaiianair\\.com/", "https://www.hawaiianair.com/"));
R.rules.push(new Rule("^http://(emarket|ifs|www)\\.hawaiianair\\.com/", "https://$1.hawaiianair.com/"));
a("hawaiianair.com");
a("*.hawaiianair.com");

R = new RuleSet("HealthCheckUSA");
R.rules.push(new Rule("^(http://(www\\.)?|https://)healthcheckusa\\.com/", "https://www.healthcheckusa.com/"));
R.rules.push(new Rule("^http://secure\\.healthcheckusa\\.com/", "https://secure.healthcheckusa.com/"));
a("healthcheckusa.com");
a("secure.healthcheckusa.com");
a("www.healthcheckusa.com");

R = new RuleSet("Hearst Corporation (partial)");
R.rules.push(new Rule("^http://(dailydeal|file)\\.chron\\.com/", "https://$1.chron.com/"));
R.rules.push(new Rule("^http://(www\\.)?myhearstnewspaper\\.com/", "https://$1myhearstnewspaper.com/"));
a("*.chron.com");
a("myhearstnewspaper.com");
a("www.myhearstnewspaper.com");

R = new RuleSet("Heathkit");
R.rules.push(new Rule("^http://(www\\.)?heathkit\\.com/", "https://www.heathkit.com/"));
a("www.heathkit.com");
a("heathkit.com");

R = new RuleSet("Heise.de (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?heise\\.de/([ai]vw-bin/|favicon\\.ico|icons/|ix/images/|software/screenshots/|stil/)", "https://www.heise.de/$1"));
a("heise.de");
a("www.heise.de");

R = new RuleSet("Hemmingway Marketing (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?voucherexpress\\.co\\.uk/([^/]+)/", "https://www.voucherexpress.co.uk/$1/"));
a("voucherexpress.co.uk");
a("www.voucherexpress.co.uk");

R = new RuleSet("Hetzner Online");
R.rules.push(new Rule("^http://hetzner\\.de/", "https://www.hetzner.de/"));
R.rules.push(new Rule("^http://(\\w+)\\.(hetzner|your-server)\\.de/", "https://$1.$2.de/"));
a("hetzner.de");
a("*.hetzner.de");
a("*.your-server.de");
a("*.webmail.your-server.de");

R = new RuleSet("Hewlett-Packard Company (partial)");
R.rules.push(new Rule("^https?://3com\\.com/", "https://www.3com.com/"));
R.rules.push(new Rule("^http://(b2bgw|login|www)\\.3com\\.com/", "https://$13com.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?compaq\\.com/", "https://www.compaq.com/"));
R.rules.push(new Rule("^http://(www(-mo)?\\.)?eds\\.com/", "https://$1eds.com/"));
R.rules.push(new Rule("^https?://hp\\.com/", "https://www.hp.com/"));
R.rules.push(new Rule("^http://www\\.hp\\.com/img/", "https://www.hp.com/img/"));
R.rules.push(new Rule("^http://ftp\\.hp\\.com/", "https://ftp.hp.com/"));
R.rules.push(new Rule("^http://(www\\.)?register\\.hp\\.com/", "https://$1register.hp.com/"));
R.rules.push(new Rule("^http://(www\\.)?shopping\\.hp\\.com/", "https://shopping.hp.com/"));
R.rules.push(new Rule("^http://welcome\\.hp\\.com/", "https://secure.hp-ww.com/"));
R.rules.push(new Rule("^http://h(1000[34]|10018|10032|10048|10057|1008[456]|10148|10151|10176|1700[3-9]|17010|18000)\\.www1\\.hp\\.com/", "https://h$1.www1.hp.com/"));
R.rules.push(new Rule("^http://h20141\\.www2\\.hp\\.com/", "https://h20141.www2.hp.com/"));
R.rules.push(new Rule("^http://esca2\\.americas\\.hp\\.com/", "https://esca2.americas.hp.com/"));
R.rules.push(new Rule("^http://esca5\\.asiapac\\.hp\\.com/", "https://esca5.asiapac.hp.com/"));
R.rules.push(new Rule("^http://esam(2)?\\.austin\\.hp\\.com/", "https://esam$1.austin.hp.com/"));
R.rules.push(new Rule("^http://(?:vausnzpro2\\.austin|20465\\.www2)\\.hp\\.com/", "https://vausnzpro2.austin.hp.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?esca\\.hp\\.com/", "https://esca2.americas.hp.com/"));
R.rules.push(new Rule("^http://esca3\\.europe\\.hp\\.com/", "https://esca3.europe.hp.com/"));
R.rules.push(new Rule("^http://h41183\\.www4\\.hp\\.com/", "https://h41183.www4.hp.com/"));
R.rules.push(new Rule("^http://(?:ssl|www\\.)?www8\\.hp\\.com/", "https://ssl.ww8.hp.com/"));
R.rules.push(new Rule("^http://(?:secure|welcome)\\.hp-ww\\.com/", "https://secure.hp-ww.com/"));
R.rules.push(new Rule("^http://by(?:\\.essl)?\\.optimost\\.com/", "https://by.essl.optimost.com/"));
R.rules.push(new Rule("^http://(www\\.)?threatlinq\\.tippingpoint\\.com/", "https://$1threatlinq.tippingpoint.com/"));
a("compaq.com");
a("www.compaq.com");
a("eds.com");
a("*.eds.com");
a("hp.com");
a("esca2.americas.hp.com");
a("esca5.asiapac.hp.com");
a("*.austin.hp.com");
a("esca3.europe.hp.com");
a("*.hp.com");
a("www.*.hp.com");
a("*.www1.hp.com");
a("*.www2.hp.com");
a("h41183.www4.hp.com");
a("www8.hp.com");
a("*.www8.hp.com");
a("*.hp-ww.com");
a("by.optimost.com");
a("by.essl.optimost.com");
a("threatlinq.tippingpoint.com");
a("www.threatlinq.tippingpoint.com");

R = new RuleSet("Hexagon");
R.rules.push(new Rule("^http://(?:www\\.)?hexagon\\.cc/", "https://hexagon.cc/"));
a("hexagon.cc");
a("www.hexagon.cc");

R = new RuleSet("Hi");
R.rules.push(new Rule("^http://(?:www\\.)?hi\\.nl/", "https://www.hi.nl/"));
R.rules.push(new Rule("^http://shop\\.(?:www\\.)?hi\\.nl/", "https://shop.www.hi.nl/"));
a("*.hi.nl");

R = new RuleSet("Hide My Ass");
R.rules.push(new Rule("^http://(?:www\\.)?hidemyass\\.com/", "https://hidemyass.com/"));
R.rules.push(new Rule("^http://(\\d+)\\.hidemyass\\.com/", "https://$1.hidemyass.com/"));
R.rules.push(new Rule("^http://static\\.hidemyass\\.com/", "https://hidemyass.cachefly.net/"));
a("hidemyass.com");
a("*.hidemyass.com");

R = new RuleSet("High Gear Media (partial)");
R.rules.push(new Rule("^http://(static\\.hgmsites\\.net|images\\.thecarconnection\\.com)/", "https://s3.amazonaws.com/$1/"));
a("static.hgmsites.net");
a("images.thecarconnection.com");

R = new RuleSet("Ai.Hitbox.com");
R.rules.push(new Rule("^http://ai\\.hitbox\\.com/", "https://ai.hitbox.com/"));
a("ai.hitbox.com");

R = new RuleSet("Hjv.dk");
R.rules.push(new Rule("^http://(www\\.)?hjv\\.dk/", "https://www.hjv.dk/"));
R.rules.push(new Rule("^http://specmod\\.hjv\\.dk/", "https://specmod.hjv.dk/"));
a("hjv.dk");
a("www.hjv.dk");
a("specmod.hjv.dk");

R = new RuleSet("Hjv.kursuslogin.dk");
R.rules.push(new Rule("^http://hjv\\.kursuslogin\\.dk/", "https://hjv.kursuslogin.dk/"));
a("hjv.kursuslogin.dk");

R = new RuleSet("Hobsons EMT (partial)");
R.rules.push(new Rule("^http://([\\w\\-]+)\\.askadmissions\\.net/", "https://$1.askadmissions.net/"));
R.exclusions.push(new Exclusion("^http://www\\."));
a("*.askadmissions.net");

R = new RuleSet("Hoefler & Frere-Jones (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?typography\\.com/(cart|images|include)/", "https://secure.typography.com/$1/"));
R.rules.push(new Rule("^http://secure\\.typography\\.com/", "https://secure.typography.com/"));
a("secure.typography.com");

R = new RuleSet("Holidaybreak (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?bookit\\.nl/", "https://www.bookit.nl/"));
R.rules.push(new Rule("^http://(?:www\\.)?djoser\\.nl/assets/", "https://djoser.nl/assets/"));
R.rules.push(new Rule("^http://cache[12]\\.djoser\\.nl/assets/djoser_2012-1\\.0\\.56/", "https://djoser.nl/assets/djoser_2012/"));
R.rules.push(new Rule("^http://(?:www\\.)?djoser(?:junior|wandelenfiets)\\.nl/(asset|cs|image)s/", "https://djoser.nl/assets/$1s/"));
R.rules.push(new Rule("^http://(www\\.)?explore\\.co\\.uk/(images/|media/|templates/)", "https://$1explore.co.uk/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?holidaybreak\\.co\\.uk/(?:holidaybreak/)?", "https://ww7.investorrelations.co.uk/holidaybreak/"));
R.rules.push(new Rule("^http://(?:www\\.)?pgl\\.co\\.uk/", "https://www.pgl.co.uk/"));
R.rules.push(new Rule("^http://(www\\.)?superbreak\\.com/", "https://$1superbreak.com/"));
R.rules.push(new Rule("^http://(img1|static)\\.superbreak\\.com/", "https://www.superbreak.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?weekendjeweg\\.nl/(favicon\\.ico|resources/)", "https://www.weekendjeweg.nl/$1"));
R.exclusions.push(new Exclusion("^http://www\\.weekendjeweg\\.nl/$"));
a("bookit.nl");
a("www.bookit.nl");
a("djoser.nl");
a("*.djoser.nl");
a("djoserjunior.nl");
a("www.djoserjunior.nl");
a("djoserwandelenfiets.nl");
a("www.djoserwandelenfiets.nl");
a("explore.co.uk");
a("www.explore.co.uk");
a("holidaybreak.co.uk");
a("www.holidaybreak.co.uk");
a("pgl.co.uk");
a("www.pgl.co.uk");
a("superbreak.com");
a("*.superbreak.com");
a("weekendjeweg.nl");
a("www.weekendjeweg.nl");

R = new RuleSet("Holtwick IT (partial)");
R.rules.push(new Rule("^http://(www\\.)?apperdeck\\.com/", "https://$1apperdeck.com/"));
a("apperdeck.com");
a("www.apperdeck.com");

R = new RuleSet("Homebase");
R.rules.push(new Rule("^http://homebase\\.co\\.uk/", "https://www.homebase.co.uk/"));
R.rules.push(new Rule("^http://www\\.homebase\\.co\\.uk/", "https://www.homebase.co.uk/"));
R.rules.push(new Rule("^http://www\\.homebase\\.com/", "https://www.homebase.co.uk/"));
R.rules.push(new Rule("^http://homebase\\.com/", "https://www.homebase.co.uk/"));
a("www.homebase.com");
a("homebase.com");
a("www.homebase.co.uk");
a("homebase.co.uk");

R = new RuleSet("Hop Studios");
R.rules.push(new Rule("^http://(www\\.)?hopstudios\\.com/", "https://$1hopstudios.com/"));
a("hopstudios.com");
a("www.hopstudios.com");

R = new RuleSet("Host Creo");
R.rules.push(new Rule("^http://(hostcreo|creocommunico)\\.com/", "https://creocommunico.com/"));
R.rules.push(new Rule("^http://(secure|www)\\.(hostcreo|creocommunico)\\.com/", "https://$1.creocommunico.com/"));
a("hostcreo.com");
a("www.hostcreo.com");
a("creocommunico.com");
a("secure.creocommunico.com");
a("www.creocommunico.com");

R = new RuleSet("Host1Plus");
R.rules.push(new Rule("^http://(\\w+\\.)?host1plus\\.com/", "https://$1host1plus.com/"));
a("host1plus.com");
a("*.host1plus.com");

R = new RuleSet("HostCentric");
R.rules.push(new Rule("^http://(secure\\.|www\\.)?hostcentric\\.com/", "https://$1hostcentric.com/"));
R.rules.push(new Rule("^http://images\\.hostcentric\\.com/", "https://secure.hostcentric.com/images/"));
a("hostcentric.com");
a("*.hostcentric.com");

R = new RuleSet("HostDime (partial)");
R.rules.push(new Rule("^http://(core\\.|forum\\.|www\\.)?hostdime\\.com/", "https://$1hostdime.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?hostdimedomains\\.com/", "https://www.hostdimedomains.com/"));
a("hostdime.com");
a("*.hostdime.com");
a("hostdimedomains.com");
a("www.hostdimedomains.com");

R = new RuleSet("Hostica.com");
R.rules.push(new Rule("^http://(www\\.)?hostica\\.com/", "https://www.hostica.com/"));
a("hostica.com");
a("www.hostica.com");

R = new RuleSet("Hostican Web Hosting");
R.rules.push(new Rule("^http://(www|chat|forum)\\.hostican\\.com/", "https://$1.hostican.com/"));
a("www.hostican.com");
a("chat.hostican.com");
a("forum.hostican.com");

R = new RuleSet("Hostmonster");
R.rules.push(new Rule("^http://(\\w+\\.)?hostmonster\\.com/", "https://$1hostmonster.com/"));
a("hostmonster.com");
a("*.hostmonster.com");

R = new RuleSet("Hosts");
R.rules.push(new Rule("^http://(?:www\\.)?hosts\\.co\\.uk/", "https://www.hosts.co.uk/"));
R.rules.push(new Rule("^http://(admin|webmail)\\.hosts\\.co\\.uk/", "https://$1.hosts.co.uk/"));
a("www.hosts.co.uk");
a("admin.hosts.co.uk");
a("webmail.hosts.co.uk");
a("hosts.co.uk");

R = new RuleSet("HotUKDeals (partial)");
R.rules.push(new Rule("^http://(www\\.)?dealspwn\\.com/(clientscript/|css/|images/|login$|writer)", "https://www.dealspwn.com/$2"));
R.rules.push(new Rule("^https://gamebase\\.dealspwn\\.com/((base|style_UK)\\.css$|images/)", "https://gamebase.dealspwn.com/$1"));
R.rules.push(new Rule("^http://(www\\.)?hotukdeals\\.com/(about$|clientscript/|contact|custom-settings|favicon\\.ico$|help|hukd-badges|images/|login|newsletter|profile/|rest-api|stylesheets/|submit|top)", "https://www.hotukdeals.com/$2"));
R.rules.push(new Rule("^http://m\\.hotukdeals\\.com/(favicon\\.ico$|images/|login/|newsletter|stylesheets/)", "https://m.hotukdeals.com/$2"));
R.rules.push(new Rule("^http://(www\\.)?mobot\\.net/", "https://www.mobot.net/"));
R.rules.push(new Rule("^http://m\\.mobot\\.net/(css/|images/|login$)", "https://m.mobot.net/$1"));
R.rules.push(new Rule("^http://(www\\.)?statichukd\\.com/", "https://www.hotukdeals.com/"));
a("dealspwn.com");
a("gamebase.dealspwn.com");
a("www.dealspwn.com");
a("hotukdeals.com");
a("m.hotukdeals.com");
a("www.hotukdeals.com");
a("mobot.net");
a("m.mobot.net");
a("www.mobot.net");
a("statichukd.com");
a("www.statichukd.com");

R = new RuleSet("Hotfile");
R.rules.push(new Rule("^http://(?:www\\.)?hotfile\\.com/", "https://hotfile.com/"));
a("www.hotfile.com");
a("hotfile.com");

R = new RuleSet("Hotwire");
R.rules.push(new Rule("^http://hotwire\\.com/", "https://www.hotwire.com/"));
R.rules.push(new Rule("^http://(cruise|extranet|www)\\.hotwire\\.com/", "https://$1.hotwire.com/"));
a("hotwire.com");
a("*.hotwire.com");

R = new RuleSet("Human Rights Campaign (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?hrc\\.org/", "https://www.hrc.org/"));
R.rules.push(new Rule("^https://hrc\\.org/", "https://www.hrc.org/"));
a("hrc.org");
a("www.hrc.org");

R = new RuleSet("Humble Bundle (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?humblebundle\\.com/", "https://www.humblebundle.com/"));
a("humblebundle.com");
a("www.humblebundle.com");

R = new RuleSet("Hungerhost");
R.rules.push(new Rule("^http://(?:www\\.)?hungerhost\\.com/", "https://hungerhost.com/"));
a("www.hungerhost.com");
a("hungerhost.com");

R = new RuleSet("Hunt Calendars");
R.rules.push(new Rule("^(http://(www\\.)?|https://)huntcal\\.com/", "https://www.huntcal.com/"));
a("huntcal.com");
a("www.huntcal.com");

R = new RuleSet("HurricaneElectric");
R.rules.push(new Rule("^http://he\\.net/", "https://www.he.net/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.he\\.net/", "https://$1.he.net/"));
a("he.net");
a("www.he.net");
a("ipv6.he.net");
a("admin.he.net");

R = new RuleSet("Hush-Hush (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?hush-hush\\.com/(cs|image)s/", "https://secure.hush-hush.com/$1s/"));
R.rules.push(new Rule("^http://secure\\.hush-hush\\.com/", "https://secure.hush-hush.com/"));
a("hush-hush.com");
a("*.hush-hush.com");

R = new RuleSet("Hushmail");
R.rules.push(new Rule("^http://(?:www\\.)?hushmail\\.com/", "https://www.hushmail.com/"));
a("www.hushmail.com");
a("hushmail.com");

R = new RuleSet("Hustler");
R.rules.push(new Rule("^http://(?:www\\.)?hustlermagazine\\.com/", "https://www.hustlermagazine.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?hustlercanada\\.com/", "https://www.hustlercanada.com/"));
a("www.hustlermagazine.com");
a("hustlermagazine.com");
a("www.hustlercanada.com");
a("hustlercanada.com");

R = new RuleSet("HypeMachine");
R.rules.push(new Rule("^http://hypem\\.com/", "https://hypem.com/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.hypem\\.com/", "https://$1.hypem.com/"));
a("hypem.com");
a("*.hypem.com");

R = new RuleSet("Hypovereinsbank");
R.rules.push(new Rule("^http://(?:www\\.)?hypovereinsbank\\.de/", "https://www.hypovereinsbank.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?hvb\\.de/", "https://www.hypovereinsbank.de/"));
a("hvb.de");
a("www.hvb.de");
a("hypovereinsbank.de");
a("www.hypovereinsbank.de");

R = new RuleSet("I Do Foundation");
R.rules.push(new Rule("^http://(?:www\\.)?idofoundation\\.org/", "https://www.idofoundation.org/"));
a("idofoundation.org");
a("www.idofoundation.org");

R = new RuleSet("International Association of Amusement Parks and Attractions");
R.rules.push(new Rule("^http://(?:www\\.)?iaapa\\.org/", "https://www.iaapa.org/"));
a("iaapa.org");
a("*.iaapa.org");

R = new RuleSet("IABM");
R.rules.push(new Rule("^http://(?:www\\.)?theiabm\\.org/", "https://www.theiabm.org/"));
a("theiabm.org");
a("www.theiabm.org");

R = new RuleSet("IANA");
R.rules.push(new Rule("^http://iana\\.org/", "https://www.iana.org/"));
R.rules.push(new Rule("^http://(data|itar|www)\\.iana\\.org/", "https://$1.iana.org/"));
a("iana.org");
a("*.iana.org");

R = new RuleSet("iAmplify (partial)");
R.rules.push(new Rule("^http://affiliate(s)?\\.iamplify\\.com/", "https://affiliate$1.iamplify.com/"));
R.rules.push(new Rule("^http://(\\w+\\.)?iamplify\\.com/(shared_|store/(shared_)?)?(css/|images/|password_forgotten|signin)", "https://$1iamplify.com/$1"));
a("iamplify.com");
a("*.iamplify.com");

R = new RuleSet("ICA.se");
R.rules.push(new Rule("^http://ica\\.se/", "https://www.ica.se/"));
R.rules.push(new Rule("^http://www\\.ica\\.se/", "https://www.ica.se/"));
a("www.ica.se");
a("ica.se");

R = new RuleSet("ICANN (partial)");
R.rules.push(new Rule("^http://((archive|ccnso|charts|community|gacweb|gnso|meetings|mm|newgtlds|prague44|www)\\.)?icann\\.org/", "https://$1icann.org/"));
R.rules.push(new Rule("^http://aso\\.icann\\.org/wp-content/", "https://aso.icann.org/wp-content/"));
R.exclusions.push(new Exclusion("^http://(aso|www\\.atlarge|nomcom)\\."));
a("icann.org");
a("*.icann.org");

R = new RuleSet("ICMail");
R.rules.push(new Rule("^http://(?:www\\.)?icmail\\.net/", "https://icmail.net/"));
a("icmail.com");
a("www.icmail.com");

R = new RuleSet("ICUK");
R.rules.push(new Rule("^http://(www\\.)?icukhosting\\.co\\.uk/", "https://www.icukhosting.co.uk/"));
a("icukhosting.co.uk");
a("www.icukhosting.co.uk");

R = new RuleSet("IDG.com.au");
R.rules.push(new Rule("^http://(www\\.)?computerworld\\.com\\.au/", "https://$1computerworld.com.au/"));
R.rules.push(new Rule("^http://demo\\.idg\\.com\\.au/", "https://demo.idg.com.au/"));
R.rules.push(new Rule("^http://cdn\\.idg\\.com\\.au/", "https://cdn.idg.com.au/"));
a("computerworld.com.au");
a("*.computerworld.com.au");
a("demo.idg.com.au");
a("cdn.idg.com.au");

R = new RuleSet("IDG.se (partial)");
R.rules.push(new Rule("^http://(www\\.)?idg\\.se/", "https://www.idg.se/"));
R.rules.push(new Rule("^http://sifomedia\\.idg\\.se/", "https://ssl.sifomedia.se/"));
R.rules.push(new Rule("^http://(www\\.)?([a-rt-v]\\w+|s[ahm]\\w+)\\.idg\\.se/", "https://$2.idg.se/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?extreme\\.idg\\.se/$"));
R.exclusions.push(new Exclusion("^http://(www\\.)?tjanster\\.idg\\.se/(dilbertimage|j|whitepaper)s/"));
a("idg.se");
a("androidguiden.idg.se");
a("business.idg.se");
a("capdesign.idg.se");
a("cloud.idg.se");
a("computersweden.idg.se");
a("cs.idg.se");
a("csjobb.idg.se");
a("extreme.idg.se");
a("idgkonto.idg.se");
a("idgmedia.idg.se");
a("it24.idg.se");
a("it24tjanster.idg.se");
a("m3.idg.se");
a("macworld.idg.se");
a("mittidg.idg.se");
a("pcforalla.idg.se");
a("pfa.idg.se");
a("prenumeration.idg.se");
a("sakerhet.idg.se");
a("shop.idg.se");
a("sifomedia.idg.se");
a("smartaremobil.idg.se");
a("techworld.idg.se");
a("tjanster.idg.se");
a("upphandling24.idg.se");
a("vendorsvoice.idg.se");
a("www.idg.se");

R = new RuleSet("IDNet");
R.rules.push(new Rule("^http://(www\\.)?idnet\\.net/", "https://www.idnet.net/"));
a("idnet.net");
a("www.idnet.net");

R = new RuleSet("IEEE");
R.rules.push(new Rule("^http://(?:www\\.)?ieee\\.org/", "https://origin.www.ieee.org/"));
a("ieee.org");
a("www.ieee.org");

R = new RuleSet("IELTS");
R.rules.push(new Rule("^http://(www\\.|results\\.)?ielts\\.org/", "https://$1ielts.org/"));
a("ielts.org");
a("*.ielts.org");

R = new RuleSet("IETF");
R.rules.push(new Rule("^http://(?:www\\.)?ietf\\.org/", "https://www.ietf.org/"));
R.rules.push(new Rule("^http://(tools|datatracker)\\.ietf\\.org/", "https://$1.ietf.org/"));
a("ietf.org");
a("www.ietf.org");
a("tools.ietf.org");
a("datatracker.ietf.org");

R = new RuleSet("IFA.ch");
R.rules.push(new Rule("^http://(?:www\\.)?ifa\\.ch/", "https://www.ifa.ch/"));
a("ifa.ch");
a("www.ifa.ch");

R = new RuleSet("IGNUM (partial)");
R.rules.push(new Rule("^http://(www\\.)?domena\\.cz/", "https://www.domena.cz/"));
R.rules.push(new Rule("^http://(www\\.)?ignum\\.cz/", "https://ignum.cz/"));
a("domena.cz");
a("www.domena.cz");
a("ignum.cz");
a("www.ignum.cz");

R = new RuleSet("iGaming (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(bwin|gambling-affiliation)\\.com/", "https://www.$1.com/"));
R.rules.push(new Rule("^http://casino\\.bwin\\.com/", "https://casino.bwin.com/"));
R.rules.push(new Rule("^http://(adserver|mcf)\\.itsfogo\\.com/", "https://$1.itsfogo.com/"));
a("bwin.com");
a("*.bwin.com");
a("gambling-affiliation.com");
a("*.gambling-affiliation.com");
a("*.itsfogo.com");

R = new RuleSet("IIS.net");
R.rules.push(new Rule("^http://www\\.iis\\.net/", "https://www.iis.net/"));
R.rules.push(new Rule("^http://learn\\.iis\\.net/", "https://learn.iis.net/"));
R.rules.push(new Rule("^http://iis\\.net/", "https://www.iis.net/"));
a("iis.net");
a("www.iis.net");
a("learn.iis.net");

R = new RuleSet("IIS.se");
R.rules.push(new Rule("^http://iis\\.se/", "https://www.iis.se/"));
R.rules.push(new Rule("^http://www\\.iis\\.se/", "https://www.iis.se/"));
a("iis.se");
a("www.iis.se");

R = new RuleSet("IKK-Gesundplus");
R.rules.push(new Rule("^http://(?:www\\.)?ikk-gesundplus\\.de/", "https://www.ikk-gesundplus.de/"));
a("www.ikk-gesundplus.de");
a("ikk-gesundplus.de");

R = new RuleSet("IKK-Suedwest");
R.rules.push(new Rule("^http://(?:www\\.)?ikk-suedwest\\.de/", "https://www.ikk-suedwest.de/"));
a("www.ikk-suedwest.de");
a("ikk-suedwest.de");

R = new RuleSet("ILO.org");
R.rules.push(new Rule("^http://ilo\\.org/", "https://www.ilo.org/"));
R.rules.push(new Rule("^http://www\\.ilo\\.org/", "https://www.ilo.org/"));
a("www.ilo.org");
a("ilo.org");

R = new RuleSet("IMDB (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?imdb\\.com/images/", "https://secure.imdb.com/images/"));
R.rules.push(new Rule("^http://(?:secure\\.|(?:i|www)\\.media-)imdb\\.com/", "https://secure.imdb.com/"));
a("imdb.com");
a("*.imdb.com");
a("*.media-imdb.com");

R = new RuleSet("IMF.org");
R.rules.push(new Rule("^http://www\\.imf\\.org/", "https://www.imf.org/"));
R.rules.push(new Rule("^http://imf\\.org/", "https://www.imf.org/"));
a("www.imf.org");
a("imf.org");

R = new RuleSet("iMedia Communications");
R.rules.push(new Rule("^http://(?:www\\.)?imediaconnection\\.com/", "https://www.imediaconnection.com/"));
a("imediaconnection.com");
a("www.imediaconnection.com");

R = new RuleSet("iNet Interactive");
R.rules.push(new Rule("^http://(www\\.)?inetinteractive\\.com/", "https://$1inetinteractive.com/"));
a("inetinteractive.com");
a("www.inetinteractive.com");

R = new RuleSet("Japan Information Technology Promotion Agency");
R.rules.push(new Rule("^http://www\\.ipa\\.go\\.jp/", "https://www.ipa.go.jp/"));
R.rules.push(new Rule("^http://(www\\.)?ipa\\.jp/", "https://www.ipa.go.jp/"));
R.rules.push(new Rule("^http://www\\.jitec\\.ipa\\.go\\.jp/", "https://www.jitec.ipa.go.jp/"));
R.rules.push(new Rule("^http://(www\\.)?jitec\\.jp/", "https://www.jitec.ipa.go.jp/"));
a("www.ipa.go.jp");
a("www.ipa.jp");
a("ipa.jp");
a("www.jitec.ipa.go.jp");
a("www.jitec.jp");
a("jitec.jp");

R = new RuleSet("IPCC.ch");
R.rules.push(new Rule("^http://ipcc\\.ch/", "https://ipcc.ch/"));
R.rules.push(new Rule("^http://www\\.ipcc\\.ch/", "https://www.ipcc.ch/"));
a("www.ipcc.ch");
a("ipcc.ch");

R = new RuleSet("iPage");
R.rules.push(new Rule("^http://ipage\\.com/", "https://www.ipage.com/"));
R.rules.push(new Rule("^http://(secure|www)\\.ipage\\.com/", "https://$1.ipage.com/"));
a("ipage.com");
a("secure.ipage.com");
a("www.ipage.com");

R = new RuleSet("IPredator");
R.rules.push(new Rule("^http://(blog\\.|www\\.)?ipredator\\.org/", "https://$1ipredator.org/"));
a("ipredator.org");
a("*.ipredator.org");

R = new RuleSet("IRF.se");
R.rules.push(new Rule("^http://www\\.irf\\.se/", "https://www.irf.se/"));
R.rules.push(new Rule("^http://irf\\.se/", "https://www.irf.se/"));
a("irf.se");
a("www.irf.se");

R = new RuleSet("ISC");
R.rules.push(new Rule("^http://(?:www\\.)?isc\\.org/", "https://www.isc.org/"));
a("isc.org");
a("www.isc.org");

R = new RuleSet("ISIS");
R.rules.push(new Rule("^http://isis\\.poly\\.edu/", "https://isis.poly.edu/"));
a("isis.poly.edu");

R = new RuleSet("ITPC");
R.rules.push(new Rule("^http://(?:www\\.)?iptc\\.org/", "https://www.iptc.org/"));
a("iptc.org");
a("www.iptc.org");

R = new RuleSet("Iberia");
R.rules.push(new Rule("^http://iberia\\.com/", "https://iberia.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.iberia\\.com/", "https://$1.iberia.com/"));
a("iberia.com");
a("*.iberia.com");

R = new RuleSet("Icculus.org");
R.rules.push(new Rule("^http://(([a-zA-Z0-9-]+\\.)?icculus\\.org)/", "https://$1/"));
a("icculus.org");
a("*.icculus.org");

R = new RuleSet("IceHeberg");
R.rules.push(new Rule("^http://(?:www\\.)?iceheberg\\.fr/", "https://www.iceheberg.fr/"));
a("iceheberg.fr");
a("www.iceheberg.fr");

R = new RuleSet("Idefix");
R.rules.push(new Rule("^http://(www\\.)?idefix\\.com/", "https://www.idefix.com/"));
a("www.idefix.com");
a("idefix.com");

R = new RuleSet("Identica");
R.rules.push(new Rule("^http://(?:www\\.)?identi\\.ca/", "https://identi.ca/"));
R.rules.push(new Rule("^http://files\\.status\\.net/", "https://files.status.net/"));
R.rules.push(new Rule("^http://(meteor\\d+\\.identi\\.ca)/", "https://$1/"));
R.rules.push(new Rule("^http://avatar\\.identi\\.ca/", "https://avatar3.status.net/i/identica/"));
R.exclusions.push(new Exclusion("^http://identi\\.ca/main/openid"));
a("*.identi.ca");
a("identi.ca");
a("files.status.net");

R = new RuleSet("IdentityTheft");
R.rules.push(new Rule("^http://(?:www\\.)?identitytheft\\.org\\.uk/", "https://www.identitytheft.org.uk/"));
a("identitytheft.org.uk");
a("www.identitytheft.org.uk");

R = new RuleSet("Igalia (partial)");
R.rules.push(new Rule("^http://labs\\.igalia\\.com/", "https://labs.igalia.com/"));
a("labs.igalia.com");

R = new RuleSet("Ikea.com");
R.rules.push(new Rule("^http://(www\\.)?ikea\\.com/", "https://www.ikea.com/"));
a("ikea.com");
a("www.ikea.com");

R = new RuleSet("ImageShack (partial)");
R.rules.push(new Rule("^http://stream\\.imageshack\\.us/favicon\\.ico$", "https://imageshack.us/favicon.ico"));
R.rules.push(new Rule("^http://(?:www\\.)?([c-r]\\w+\\.)?imageshack\\.us/", "https://$1imageshack.us/"));
R.exclusions.push(new Exclusion("^http://img\\d{1,3}\\."));
a("imageshack.us");
a("*.imageshack.us");

R = new RuleSet("Imgur");
R.rules.push(new Rule("^http://(?:origin\\.|s\\.|www\\.)?imgur\\.com/", "https://imgur.com/"));
R.rules.push(new Rule("^http://i\\.imgur\\.com/((images|include)(/.*)?)?$", "https://imgur.com/$1"));
R.exclusions.push(new Exclusion("^http://api\\.imgur\\.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?imgur\\.com/[a-zA-Z\\d]+\\.[a-z]+$"));
a("imgur.com");
a("*.imgur.com");

R = new RuleSet("Immunityinc.com");
R.rules.push(new Rule("^http://immunityinc\\.com/", "https://immunityinc.com/"));
R.rules.push(new Rule("^http://www\\.immunityinc\\.com/", "https://www.immunityinc.com/"));
a("immunityinc.com");
a("www.immunityinc.com");

R = new RuleSet("Imrworldwide.com");
R.rules.push(new Rule("^http://secure-(\\w\\w)\\.imrworldwide\\.com/", "https://secure-$1.imrworldwide.com/"));
a("*.imrworldwide.com");

R = new RuleSet("InMotion Hosting");
R.rules.push(new Rule("^http://(www\\.)?chatwithourteam\\.com/", "https://$1chatwithourteam.com/"));
R.rules.push(new Rule("^http://((www\\.)?secure\\d\\d?\\.|www\\.)?inmotionhosting\\.com/", "https://$1inmotionhosting.com/"));
R.rules.push(new Rule("^http://img0\\d\\.inmotionhosting\\.com/", "https://secure1.inmotionhosting.com/"));
a("chatwithourteam.com");
a("www.chatwithourteam.com");
a("*.www.chatwithourteam.com");
a("inmotionhosting.com");
a("*.inmotionhosting.com");
a("www.*.inmotionhosting.com");

R = new RuleSet("Indeed (partial)");
R.rules.push(new Rule("^http://(secure\\.)?indeed\\.com/", "https://$1indeed.com/"));
R.rules.push(new Rule("^http://(?:www\\.)indeed\\.com/(images/)", "https://secure.indeed.com/$1"));
a("indeed.com");
a("*.indeed.com");

R = new RuleSet("Independent Centre for Privacy Protection Schleswig-Holstein");
R.rules.push(new Rule("^http://(?:www\\.)?datenschutzzentrum\\.de/", "https://www.datenschutzzentrum.de/"));
a("datenschutzzentrum.de");
a("www.datenschutzzentrum.de");

R = new RuleSet("Indiegogo (partial)");
R.rules.push(new Rule("^http://(www\\.)?indiegogo\\.com/(account/|blog/|images/|styles/)", "https://$1indiegogo.com/$2"));
R.rules.push(new Rule("^http://web(\\d)\\.indiegogo\\.com/", "https://web$1.indiegogo.com/"));
a("indiegogo.com");
a("*.indiegogo.com");

R = new RuleSet("Indovina Bank");
R.rules.push(new Rule("^http://ebanking\\.indovinabank\\.com\\.vn/", "https://ebanking.indovinabank.com.vn/"));
a("ebanking.indovinabank.com.vn");

R = new RuleSet("Indybay");
R.rules.push(new Rule("^http://(www\\.)?indybay\\.org/", "https://www.indybay.org/"));
a("www.indybay.org");
a("indybay.org");

R = new RuleSet("Indymedia.org", "http:.*indymedia\\.org(\\.uk)?");
R.rules.push(new Rule("^http://indymedia\\.org/", "https://indymedia.org/"));
R.rules.push(new Rule("^http://www\\.([^/:@\\.]+)\\.indymedia\\.org/", "https://www.$1.indymedia.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.indymedia\\.org/", "https://$1.indymedia.org/"));
R.rules.push(new Rule("^http://indymedia\\.org\\.uk/", "https://indymedia.org.uk/"));
R.rules.push(new Rule("^http://(london|notts|sheffield)\\.indymedia\\.org\\.uk/", "https://$1.indymedia.org.uk/"));
R.rules.push(new Rule("^http://www\\.(london|notts|sheffield)\\.indymedia\\.org\\.uk/", "https://www.$1.indymedia.org.uk/"));
R.rules.push(new Rule("^http://northern-indymedia\\.org/", "https://northern-indymedia.org/"));
R.rules.push(new Rule("^http://(www|m|mobi|mobile|wap)\\.northern-indymedia\\.org/", "https://$1.northern-indymedia.org/"));
R.rules.push(new Rule("^http://(www\\.)?northernindymedia\\.org/", "https://$1northern-indymedia.org/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?(print|translations|satellite)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?(de|pr|india|italia|beirut)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://(ambazonia|austin|beirut|bergstedt|blackcat|bulgaria|canarias|chiapas|colorado|dc|dl1\\.video|hm|hudsonmohawk|jakarta|korea|laplana|lille1|mail\\.se|minneapolis|mke|nettlau|newsreal|nycap|old\\.estrecho|ottawa|perth|pl|rochester|romania|rous|russia|shiva|sweden|twincities|victoria|wmass|worcester|(www(1)?\\.)?mexico|www3\\.ch)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://(media[12]?\\.argentina|buscador\\.argentina)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://((dev\\.)?boston)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://((www2?\\.)?brasil|brazil)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://(chicago|chicago2|www0\\.chicago|dev\\.chicago)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://(de|media[12]?\\.de|www[23]\\.de|www[23]\\.germany)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://((www[12]\\.)?istanbul|media2?\\.istanbul|bagimsiz-istanbul|istanbul\\.bbm)\\.indymedia\\.org/"));
R.exclusions.push(new Exclusion("^http://((publish\\.)?sandiego)\\.indymedia\\.org/"));
a("indymedia.org");
a("*.indymedia.org");
a("www.*.indymedia.org");
a("indymedia.org.uk");
a("*.indymedia.org.uk");
a("www.*.indymedia.org.uk");
a("northern-indymedia.org");
a("*.northern-indymedia.org");

R = new RuleSet("Inet.se");
R.rules.push(new Rule("^http://(?:www\\.)?inet\\.se/", "https://www.inet.se/"));
a("inet.se");
a("www.inet.se");

R = new RuleSet("InfNX");
R.rules.push(new Rule("^http://(idn|static)\\.infnx\\.com/", "https://s3.amazonaws.com/$1.infnx.com/"));
a("*.infnx.com");

R = new RuleSet("Infocube (partial)");
R.rules.push(new Rule("^http://(a[35]\\.|www\\.)?ogt\\.jp/", "https://$1ogt.jp/"));
a("ogt.jp");
a("*.ogt.jp");

R = new RuleSet("Informa (partial)");
R.rules.push(new Rule("^http://(crcpress|garlandscience|routledgeweb|tandfonline|taylorandfrancis)\\.com/", "https://www.$1.com/"));
R.rules.push(new Rule("^http://www\\.(crcpress|garlandscience|tandfonline)\\.com/(_?res|a4j/|action/(clickThrough|mobileDevicePairingLogin|registration|resources|show(Cart|Login))|content|(css|img)Jawr/|coverimage/|favicon|na101/|sda/|(templat|userimag)es/|twitter\\.html|[\\w\\-]+/\\w+_signin\\.jsf)", "https://www.$1.com/$2"));
R.rules.push(new Rule("^http://(files|img|lib)\\.routledgeweb\\.com/", "https://$1.routledgeweb.com/"));
R.rules.push(new Rule("^http://www\\.(routledgeweb|taylorandfrancis)\\.com/(account/|favicon)", "https://www.$1.com/$2"));
R.rules.push(new Rule("^http://www\\.taylorandfrancis\\.com/(account/|favicon)", "https://www.taylorandfrancis.com/$1"));
a("crcpress.com");
a("www.crcpress.com");
a("garlandscience.com");
a("www.garlandscience.com");
a("*.routledgeweb.com");
a("tandfonline.com");
a("www.tandfonline.com");
a("taylorandfrancis.com");
a("www.taylorandfrancis.com");

R = new RuleSet("InformationWeek");
R.rules.push(new Rule("^http://(?:www\\.)?byte\\.com/", "https://www.informationweek.com/byte/"));
R.rules.push(new Rule("^http://(www\\.)?informationweek\\.com/", "https://$1informationweek.com/"));
a("byte.com");
a("www.byte.com");
a("informationweek.com");
a("www.informationweek.com");

R = new RuleSet("InfoWorld.com");
R.rules.push(new Rule("^http://infoworld\\.com/", "https://www.infoworld.com/"));
R.rules.push(new Rule("^http://www\\.infoworld\\.com/", "https://www.infoworld.com/"));
a("infoworld.com");
a("www.infoworld.com");

R = new RuleSet("infradead.org (partial)");
R.rules.push(new Rule("^http://(?:www\\.)infradead\\.org/", "https://infradead.org/"));
a("infradead.org");
a("www.infradead.org");

R = new RuleSet("Infragard.net");
R.rules.push(new Rule("^http://(?:www\\.)?infragard\\.net/", "https://www.infragard.net/"));
a("infragard.net");
a("www.infragard.net");

R = new RuleSet("Infusionsoft (partial)");
R.rules.push(new Rule("^http://customerhub\\.net/$", "https://customerhub.net/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.customerhub\\.net/", "https://$1.customerhub.net/"));
R.rules.push(new Rule("^http://(crm\\.|www\\.)?infusionsoft\\.com/", "https://$1infusionsoft.com/"));
R.exclusions.push(new Exclusion("^http://(help|kb|www)\\.customerhub\\."));
R.exclusions.push(new Exclusion("^http://(help(center)?|marketplace)\\.infusionsoft\\."));
a("customerhub.net");
a("*.customerhub.net");
a("infusionsoft.com");
a("www.infusionsoft.com");

R = new RuleSet("ING DIRECT");
R.rules.push(new Rule("^http://(?:www\\.)?ingdirect\\.es/", "https://www.ingdirect.es/"));
a("ingdirect.es");
a("www.ingdirect.es");

R = new RuleSet("Inria.fr");
R.rules.push(new Rule("^http://www\\.inria\\.fr/", "https://www.inria.fr/"));
R.rules.push(new Rule("^http://inria\\.fr/", "https://www.inria.fr/"));
R.rules.push(new Rule("^http://planete\\.inria\\.fr/", "https://planete.inria.fr/"));
a("www.inria.fr");
a("inria.fr");
a("planete.inria.fr");

R = new RuleSet("Inschrijven.nl");
R.rules.push(new Rule("^http://(?:www\\.)?inschrijven\\.nl/", "https://www.inschrijven.nl/"));
a("www.inschrijven.nl");
a("inschrijven.nl");

R = new RuleSet("Insight");
R.rules.push(new Rule("^http://insight\\.com/", "https://www.insight.com/"));
R.rules.push(new Rule("^http://(www|uk)\\.insight\\.com/", "https://$1.insight.com/"));
R.rules.push(new Rule("^http://(i|img|images|imagesqa)(\\d+)\\.insight\\.com/", "https://$1$2.insight.com/"));
a("insight.com");
a("*.insight.com");

R = new RuleSet("Instagram (partial)");
R.rules.push(new Rule("^http://api\\.instagram\\.com/", "https://api.instagram.com/"));
R.rules.push(new Rule("^http://images\\.instagram\\.com/", "https://distillery.s3.amazonaws.com/"));
R.rules.push(new Rule("^http://instagr\\.am/p/", "https://instagr.am/p/"));
R.rules.push(new Rule("^http://instagr\\.am/static/images/", "https://s3.amazonaws.com/instagram-static/images/"));
R.rules.push(new Rule("^http://instagr\\.am/(p|static)/", "https://instagr.am/$1/"));
a("api.instagram.com");
a("images.instagram.com");
a("instagr.am");

R = new RuleSet("InstantSSL");
R.rules.push(new Rule("^http://(?:www\\.)?instantssl\\.com/", "https://www.instantssl.com/"));
a("www.instantssl.com");
a("instantssl.com");

R = new RuleSet("Instapaper");
R.rules.push(new Rule("^http://(?:www\\.)?instapaper\\.com/", "https://www.instapaper.com/"));
a("www.instapaper.com");
a("instapaper.com");

R = new RuleSet("Intent Media (partial)");
R.rules.push(new Rule("^http://(www\\.)?(bikebiz|develop-online|intentmedia|mcvuk|mobile-ent|pcr-online)\\.(biz|com|co\\.uk|net)/", "https://www.$2.$3/"));
a("bikebiz.com");
a("www.bikebiz.com");
a("develop-online.net");
a("www.develop-online.net");
a("intentmedia.co.uk");
a("www.intentmedia.co.uk");
a("mcvuk.com");
a("www.mcvuk.com");
a("mobile-ent.biz");
a("www.mobile-ent.biz");
a("pcr-online.biz");
a("www.pcr-online.biz");

R = new RuleSet("intentmedia.net (partial)");
R.rules.push(new Rule("^http://a\\.intentmedia\\.net/", "https://a.intentmedia.net/"));
a("a.intentmedia.net");

R = new RuleSet("InterNetworX");
R.rules.push(new Rule("^http://(?:www\\.)?inwx\\.de/", "https://www.inwx.de/"));
a("*.inwx.de");
a("inwx.de");

R = new RuleSet("InterWorx (partial)");
R.rules.push(new Rule("^http://((my|support|www)\\.)?interworx\\.com/", "https://$1interworx.com/"));
a("interworx.com");
a("*.interworx.com");

R = new RuleSet("Interactive Marketing Solutions");
R.rules.push(new Rule("^(http://(www\\.)?|https://)ims-dm\\.com/", "https://www.ims-dm.com/"));
a("ims-dm.com");
a("www.ims-dm.com");

R = new RuleSet("Interactive Media Awards");
R.rules.push(new Rule("^http://(www\\.)?interactivemediaawards\\.com/", "https://www.interactivemediaawards.com/"));
a("interactivemediaawards.com");
a("www.interactivemediaawards.com");

R = new RuleSet("Interclick");
R.rules.push(new Rule("^http://(\\w+)\\.interclick\\.com/", "https://$1.interclick.com/"));
R.exclusions.push(new Exclusion("^http://(blog|ir|www)\\."));
R.exclusions.push(new Exclusion("^http://portal.interclick.com/$"));
a("*.interclick.com");

R = new RuleSet("Internap Network Services (partial)");
R.rules.push(new Rule("^http://http\\.cdnlayer\\.com/", "https://sslcdce.internapcdn.net/"));
R.rules.push(new Rule("^http://customers\\.internap\\.com/", "https://customers.internap.com/"));
R.rules.push(new Rule("^http://promo\\.internap\\.com/ImgHost/", "https://app.manticoretechnolgy.com/ImgHost/"));
R.rules.push(new Rule("^http://www\\.internap\\.co\\.jp/", "https://www.internap.co.jp/"));
R.rules.push(new Rule("^http://sslcdce\\.internapcdn\\.net/", "https://sslcdce.internapcdn.net/"));
a("http.cdnlayer.com");
a("*.internap.com");
a("www.internap.co.jp");
a("sslcdce.internapcdn.net");

R = new RuleSet("International Finance Corporation (partial)");
R.rules.push(new Rule("^http://(www\\.)?gefpmis\\.org/", "https://$1gefpmis.org/"));
R.rules.push(new Rule("^http://smartlessons\\.ifc\\.org/", "https://smartlessons.ifc.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?miga\\.org/", "https://www.miga.org/"));
R.rules.push(new Rule("^http://thegef\\.org/", "https://thegef.org/"));
R.rules.push(new Rule("^http://(www\\.)?thegef\\.org/gef/(misc/|sites/|user)/", "https://$1thegef.org/gef/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?wbginvestmentclimate\\.org/", "https://www.wbginvestmentclimate.org/"));
R.rules.push(new Rule("^http://openknowledge\\.worldbank\\.org/", "https://openknowledge.worldbank.org/"));
a("gefpmis.org");
a("www.gefpmis.org");
a("smartlessons.ifc.org");
a("miga.org");
a("www.miga.org");
a("thegef.org");
a("www.thegef.org");
a("wbginvestmentclimate.org");
a("www.wbginvestmentclimate.org");
a("openknowledge.worldbank.org");

R = new RuleSet("Internet Society (partial)");
R.rules.push(new Rule("^http://(www\\.)?internetsociety\\.org/(modul|sit)es/", "https://internetsociety.org/$2es/"));
R.rules.push(new Rule("^http://portal\\.isoc\\.org/", "https://portal.isoc.org/"));
a("internetsociety.org");
a("www.internetsociety.org");
a("portal.isoc.org");

R = new RuleSet("Internet.bs");
R.rules.push(new Rule("^http://(www\\.)?internetbs\\.net/", "https://internetbs.net/"));
a("internetbs.net");
a("www.internetbs.net");

R = new RuleSet("Internews");
R.rules.push(new Rule("^http://(www\\.)?internews\\.org/", "https://www.internews.org/"));
a("www.internews.org");
a("internews.org");

R = new RuleSet("Interpol");
R.rules.push(new Rule("^http://(?:www\\.)?interpol\\.int/", "https://www.interpol.int/"));
a("interpol.int");
a("www.interpol.int");

R = new RuleSet("Intuitiv (partial)");
R.rules.push(new Rule("^http://(\\w+)\\.csmres\\.co\\.uk/", "https://$1.csmres.co.uk/"));
R.exclusions.push(new Exclusion("^http://www\\.csmres\\.co\\.uk/"));
a("*.csmres.co.uk");

R = new RuleSet("InvestSMART (partial)");
R.rules.push(new Rule("^https?://investsmart\\.com\\.au/", "https://www.investsmart.com.au/"));
R.rules.push(new Rule("^http://www\\.investsmart\\.com\\.au/(banner_ads|images|membership|share_trading|style)/", "https://www.investsmart.com.au/$1/"));
a("investsmart.com.au");
a("www.investsmart.com.au");

R = new RuleSet("Investors in People (partial)");
R.rules.push(new Rule("^http://www\\.investorsinpeople\\.co\\.uk/(HeaderLowerRightImage|Lytebox|PublishingImages)/", "https://www.investorsinpeople.co.uk/$1/"));
a("www.investorsinpeople.co.uk");

R = new RuleSet("Invision Power Services (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?invisionpower\\.com/", "https://www.invisionpower.com/"));
a("invisionpower.com");
a("*.invisionpower.com");

R = new RuleSet("Irish Broadband");
R.rules.push(new Rule("^http://irishbroadband\\.ie/", "https://www.irishbroadband.ie/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.irishbroadband\\.ie/", "https://$1.irishbroadband.ie/"));
a("irishbroadband.ie");
a("*.irishbroadband.ie");

R = new RuleSet("IsoHunt");
R.rules.push(new Rule("^http://(?:www\\.)?(ca\\.)?isohunt\\.com/", "https://$1isohunt.com/"));
a("isohunt.com");
a("*.isohunt.com");

R = new RuleSet("Itex");
R.rules.push(new Rule("^http://(?:www\\.)?itex\\.com/", "https://www.itex.com/"));
a("itex.com");
a("*.itex.com");

R = new RuleSet("Ithaka (partial)");
R.rules.push(new Rule("^http://(www\\.)?jstor\\.org/((jawrcss|literatum|stable|templates|userimages)/|action/(myJstorSettings|registration|show(Login|RegistrationUpdate)))", "https://www.jstor.org/$2"));
a("jstor.org");
a("www.jstor.org");

R = new RuleSet("Ithaca College");
R.rules.push(new Rule("^http://(www\\.)?ithaca\\.edu/", "https://ithaca.edu/"));
a("www.ithaca.edu");
a("ithaca.edu");

R = new RuleSet("Itpol.dk");
R.rules.push(new Rule("^http://(www\\.)?itpol\\.dk/", "https://www.itpol.dk/"));
a("itpol.dk");
a("www.itpol.dk");

R = new RuleSet("ItsLearning");
R.rules.push(new Rule("^http://(?:www\\.)?itslearning\\.com/", "https://www.itslearning.com/"));
a("www.itslearning.com");
a("itslearning.com");

R = new RuleSet("Ixquick");
R.rules.push(new Rule("^http://ixquick\\.com/", "https://ixquick.com/"));
R.rules.push(new Rule("^http://([^@/:]*)\\.ixquick\\.com/", "https://$1.ixquick.com/"));
R.rules.push(new Rule("^http://([^@/:]*)\\.ixquick-proxy\\.com/", "https://$1.ixquick-proxy.com/"));
R.rules.push(new Rule("^http://startpage\\.com/", "https://startpage.com/"));
R.rules.push(new Rule("^http://([^@/:]*)\\.startpage\\.com/", "https://$1.startpage.com/"));
R.rules.push(new Rule("^http://startingpage\\.com/", "https://startingpage.com/"));
R.rules.push(new Rule("^http://([^@/:]*)\\.startingpage\\.com/", "https://$1.startingpage.com/"));
a("ixquick.com");
a("*.ixquick.com");
a("startpage.com");
a("*.startpage.com");
a("startingpage.com");
a("*.startingpage.com");
a("*.ixquick-proxy.com");

R = new RuleSet("JANET");
R.rules.push(new Rule("^http://(?:www\\.)?ja\\.net/", "https://www.ja.net/"));
a("ja.net");
a("www.ja.net");

R = new RuleSet("JBoss");
R.rules.push(new Rule("^http://([^/@:]*)\\.jboss\\.com/", "https://$1.jboss.com/"));
R.rules.push(new Rule("^http://([^/@:]*)\\.jboss\\.org/", "https://$1.jboss.org/"));
R.exclusions.push(new Exclusion("^http://download\\.jboss\\.(com|org)/"));
a("jboss.com");
a("*.jboss.com");
a("*.jboss.org");

R = new RuleSet("JDI Dating (partial)");
R.rules.push(new Rule("^http://(www\\.)?fbdatesecure\\.com/", "https://$1fbdatesecure.com/"));
a("fbdatesecure.com");
a("www.fbdatesecure.com");

R = new RuleSet("JP-CERT");
R.rules.push(new Rule("^http://www\\.jpcert\\.or\\.jp/", "https://www.jpcert.or.jp/"));
a("www.jpcert.or.jp");

R = new RuleSet("jQuery (partial)");
R.rules.push(new Rule("^http://forum\\.jquery\\.com/", "https://forum.jquery.com/"));
a("forum.jquery.com");

R = new RuleSet("JVN.jp");
R.rules.push(new Rule("^http://jvn\\.jp/", "https://jvn.jp/"));
a("jvn.jp");

R = new RuleSet("The Jack and Jill Children's Foundation Charity");
R.rules.push(new Rule("^http://(www\\.)?jackandjill\\.ie/", "https://www.jackandjill.ie/"));
R.rules.push(new Rule("^http://(www\\.)?jackandjillraffle\\.org/", "https://www.jackandjillraffle.org/"));
R.rules.push(new Rule("^https?://(www\\.)?jackandjillraffle\\.com/", "https://www.jackandjillraffle.org/"));
a("jackandjill.ie");
a("www.jackandjill.ie");
a("jackandjillraffle.com");
a("www.jackandjillraffle.com");
a("jackandjillraffle.org");
a("www.jackandjillraffle.org");

R = new RuleSet("JAKO-O");
R.rules.push(new Rule("^http://(?:www\\.)?jako-o\\.(at|com|de|eu|lu)/", "https://www.jako-o.$1/"));
a("jako-o.*");
a("www.jako-o.de");
a("www.jako-o.at");
a("www.jako-o.lu");
a("www.jako-o.eu");
a("www.jako-o.com");

R = new RuleSet("jambit");
R.rules.push(new Rule("^http://(www\\.)?jambit\\.com/", "https://$1jambit.com/"));
a("jambit.com");
a("www.jambit.com");

R = new RuleSet("Jamendo (partial)");
R.rules.push(new Rule("^http://cdn\\.imgjam\\.com/", "https://s3.amazonaws.com/imgcdn.jamendo.com/"));
a("cdn.imgjam.com");

R = new RuleSet("JanRain (partial)");
R.rules.push(new Rule("^http://(community|(dashboard-)?login|support)\\.janrain\\.com/", "https://$1.janrain.com/"));
R.rules.push(new Rule("^http://(dashboard-login\\.|www\\.)?janraincapture\\.com/", "https://$1janraincapture.com/"));
R.rules.push(new Rule("^http://info\\.janrain\\.com/", "https://actonsoftware.com/"));
R.rules.push(new Rule("^http://cdn\\.quilt\\.janrain\\.com/", "https://s3.amazonaws.com/janrain.quilt/"));
R.rules.push(new Rule("^http://(\\d+)\\.myopenid\\.com/", "https://$1.myopenid.com/"));
R.rules.push(new Rule("^http://(?:cdn|static)\\.rpxnow\\.com/", "https://s3.amazonaws.com/static.rpxnow.com/"));
R.rules.push(new Rule("^http://(\\w+\\.)?rpxnow\\.com/", "https://$1rpxnow.com/"));
a("*.janrain.com");
a("cdn.quilt.janrain.com");
a("janraincapture.com");
a("*.janraincapture.com");
a("*.myopenid.com");
a("rpxnow.com");
a("*.rpxnow.com");

R = new RuleSet("D.S.V. Sint Jansbrug");
R.rules.push(new Rule("^http://www\\.(?:sint)?jansbrug\\.nl/", "https://www.sintjansbrug.nl/"));
a("www.sintjansbrug.nl");
a("www.jansbrug.nl");

R = new RuleSet("Japan Airlines");
R.rules.push(new Rule("^http://(?:www\\.)?jal\\.co\\.jp/", "https://www.jal.co.jp/"));
a("jal.co.jp");
a("www.jal.co.jp");

R = new RuleSet("Japanese government (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?challenge25\\.go\\.jp/", "https://www.challenge25.go.jp/"));
a("challenge25.go.jp");
a("www.challenge25.go.jp");

R = new RuleSet("Jappix");
R.rules.push(new Rule("^http://(?:www\\.)?jappix\\.com/", "https://www.jappix.com/"));
a("jappix.com");
a("www.jappix.com");

R = new RuleSet("Java");
R.rules.push(new Rule("^http://(?:www\\.)?java\\.com(?::80)?/", "https://www.java.com/"));
R.rules.push(new Rule("^https://(?:www\\.)?java\\.com:80/", "https://www.java.com/"));
a("java.com");
a("www.java.com");

R = new RuleSet("Jet2.com");
R.rules.push(new Rule("^http://jet2\\.com/", "https://www.jet2.com/"));
R.rules.push(new Rule("^http://(intranet|reservations|www)\\.jet2\\.com/", "https://$1.jet2.com/"));
a("jet2.com");
a("*.jet2.com");

R = new RuleSet("JetBrains (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?jetbrains\\.com/", "https://www.jetbrains.com/"));
R.rules.push(new Rule("^http://blogs\\.jetbrains\\.com/", "https://www.jetbrains.com/blogs/"));
a("jetbrains.com");
a("*.jetbrains.com");

R = new RuleSet("Jinx.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?jinx\\.com/((content|css|images|img|shop/coll)/|theme_css\\.ashx)", "https://www.jinx.com/$2"));
R.exclusions.push(new Exclusion("^http://www\\.jinx\\.com/(.+/)?$"));
a("jinx.com");
a("www.jinx.com");

R = new RuleSet("JobMatch (partial)");
R.rules.push(new Rule("^http://([^\\.]+)\\.iapplicants\\.com/i(mag|nclud)es/", "https://$1.iapplicants.com/i$2es/"));
R.exclusions.push(new Exclusion("^http://www\\."));
a("*.iapplicants.com");

R = new RuleSet("jobScore (partial)");
R.rules.push(new Rule("^http://(blog\\.|www\\.)?jobscore\\.com/", "https://$1jobscore.com/"));
R.rules.push(new Rule("^http://support\\.jobscore\\.com/(generated|images|system)/", "https://support.jobscore.com/$1/"));
R.rules.push(new Rule("^http://(\\w+)\\.jobscore\\.com/((account_)?stylesheets/|favicon\\.ico$|images/)", "https://$1.jobscore.com/$2"));
a("jobscore.com");
a("*.jobscore.com");

R = new RuleSet("Jobscout24");
R.rules.push(new Rule("^http://(?:www\\.)?jobscout24\\.de/", "https://www.jobscout24.de/"));
a("jobscout24.de");
a("www.jobscout24.de");

R = new RuleSet("Jobs2Web");
R.rules.push(new Rule("^http://(?:www\\.)?jobs2web\\.com/", "https://www.jobs2web.com/"));
a("jobs2web.com");
a("*.jobs2web.com");

R = new RuleSet("Joker");
R.rules.push(new Rule("^http://([^/:@]*\\.)?joker\\.com/", "https://$1joker.com/"));
a("*.joker.com");
a("joker.com");

R = new RuleSet("JonDos");
R.rules.push(new Rule("^http://(www\\.)?anonym-surfen\\.de/", "https://$1anonym-surfen.de/"));
R.rules.push(new Rule("^http://(\\w+\\.)?anonymous-proxy-servers\\.net/", "https://$1anonymous-proxy-servers.net/"));
R.rules.push(new Rule("^http://www\\.ip-check\\.info/", "https://ip-check.info/"));
R.rules.push(new Rule("^http://(www\\.)?jondos\\.org/", "https://$1jondos.org/"));
R.exclusions.push(new Exclusion("^http://ip-check\\.info/$"));
a("anonymous-proxy-servers.net");
a("*.anonymous-proxy-servers.net");
a("anonym-surfen.de");
a("*.anonym-surfen.de");
a("ip-check.info");
a("www.ip-check.info");
a("jondos.org");
a("www.jondos.org");

R = new RuleSet("Joslin Diabetes Center");
R.rules.push(new Rule("^http://(?:www\\.)?joslin\\.org/", "https://www.joslin.org/"));
R.rules.push(new Rule("^https://joslin\\.org/", "https://www.joslin.org/"));
a("joslin.org");
a("www.joslin.org");

R = new RuleSet("Jottit");
R.rules.push(new Rule("^http://jottit\\.com/", "https://jottit.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.jottit\\.com/", "https://$1.jottit.com/"));
a("jottit.com");
a("*.jottit.com");

R = new RuleSet("Journeyed");
R.rules.push(new Rule("^http://(www\\.)?journeyed\\.com/", "https://www.journeyed.com/"));
a("www.journeyed.com");
a("journeyed.com");

R = new RuleSet("Joyclub.de");
R.rules.push(new Rule("^http://(www\\.)?joyclub\\.de/", "https://www.joyclub.de/"));
a("joyclub.de");
a("www.joyclub.de");

R = new RuleSet("Joyent (partial)");
R.rules.push(new Rule("^http://joyent\\.com/", "https://www.joyent.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.joyent\\.com/", "https://$1.joyent.com/"));
R.rules.push(new Rule("^http://([\\w\\-]*api|my)\\.joyentcloud\\.com/", "https://$1.joyentcloud.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?no\\.de/", "https://no.de/"));
a("joyent.com");
a("*.joyent.com");
a("*.joyentcloud.com");
a("no.de");
a("www.no.de");

R = new RuleSet("Juniper Networks");
R.rules.push(new Rule("^http://(?:www\\.)?juniper\\.net/", "https://www.juniper.net/"));
a("www.juniper.net");
a("juniper.net");

R = new RuleSet("JunoDownload");
R.rules.push(new Rule("^http://(secure\\.|www\\.)?junodownload\\.com/", "https://secure.junodownload.com/"));
R.exclusions.push(new Exclusion("^http://www\\.junodownload\\.com/crossdomain\\.xml$"));
R.exclusions.push(new Exclusion("^http://www\\.junodownload\\.com/api/.+/track/dostream"));
R.exclusions.push(new Exclusion("^http://(www\\.)?junodownload\\.com/plus/"));
a("junodownload.com");
a("www.junodownload.com");
a("secure.junodownload.com");

R = new RuleSet("JunoRecords");
R.rules.push(new Rule("^http://(www\\.|secure\\.)?juno\\.co\\.uk/", "https://secure.juno.co.uk/"));
R.rules.push(new Rule("^http://(www\\.)?junostatic\\.com/", "https://static.juno.co.uk/"));
R.rules.push(new Rule("^http://(images|cms)\\.junostatic\\.com/", "https://images.juno.co.uk/"));
R.exclusions.push(new Exclusion("^http://www\\.juno\\.co\\.uk/crossdomain\\.xml$"));
a("juno.co.uk");
a("www.juno.co.uk");
a("secure.juno.co.uk");
a("junostatic.com");
a("www.junostatic.com");
a("cms.junostatic.com");
a("images.junostatic.com");

R = new RuleSet("Jusek.se");
R.rules.push(new Rule("^http://jusek\\.se/", "https://www.jusek.se/"));
R.rules.push(new Rule("^http://www\\.jusek\\.se/", "https://www.jusek.se/"));
a("jusek.se");
a("www.jusek.se");

R = new RuleSet("Just Develop It (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?intellichat\\.com/", "https://$1intellchat.com/"));
R.rules.push(new Rule("^http://(\\w+\\.)?(just|zip)cloud\\.com/", "https://$1$2cloud.com/"));
R.rules.push(new Rule("^http://(\\w+\\.)?justhost\\.com/", "https://$1justhost.com/"));
R.rules.push(new Rule("^http://(\\w+\\.)?my(chatagent|pcbackup)\\.com/", "https://$1my$2.com/"));
R.rules.push(new Rule("^http://mymerchantguard\\.com/", "https://mymerchantguard.com/"));
R.exclusions.push(new Exclusion("^http://reviews\\.justhost\\."));
a("intellichat.com");
a("*.intellichat.com");
a("justcloud.com");
a("*.justcloud.com");
a("justhost.com");
a("*.justhost.com");
a("mymerchantguard.com");
a("mychatagent.com");
a("www.mychatagent.com");
a("mypcbackup.com");
a("*.mypcbackup.com");
a("zipcloud.com");
a("*.zipcloud.com");

R = new RuleSet("JustGive");
R.rules.push(new Rule("^http://justgive\\.org/", "https://www.justgive.org/"));
R.rules.push(new Rule("^http://(www|ido)\\.justgive\\.org/", "https://$1.justgive.org/"));
a("justgive.org");
a("www.justgive.org");
a("ido.justgive.org");

R = new RuleSet("JustGiving");
R.rules.push(new Rule("^(http://(www\\.)?|https://)justgiving\\.com/", "https://www.justgiving.com/"));
R.rules.push(new Rule("^http://secure\\.justgiving\\.com/", "https://secure.justgiving.com/"));
a("justgiving.com");
a("*.justgiving.com");

R = new RuleSet("JustTomatoes.com");
R.rules.push(new Rule("^http://(?:www\\.)?justtomatoes\\.com/", "https://www.justtomatoes.com/"));
a("justtomatoes.com");
a("www.justtomatoes.com");

R = new RuleSet("KASserver.com");
R.rules.push(new Rule("^http://(www\\.)?kasserver\\.com/", "https://kasserver.com/"));
a("kasserver.com");
a("www.kasserver.com");

R = new RuleSet("KAU.se");
R.rules.push(new Rule("^http://kau\\.se/", "https://www.kau.se/"));
R.rules.push(new Rule("^http://www\\.kau\\.se/", "https://www.kau.se/"));
a("www.kau.se");
a("kau.se");

R = new RuleSet("KDE (partial)");
R.rules.push(new Rule("^http://(bugs|mail|blogs)\\.kde\\.org/", "https://$1.kde.org/"));
a("bugs.kde.org");
a("mail.kde.org");
a("blogs.kde.org");

R = new RuleSet("KEMI.se");
R.rules.push(new Rule("^http://www\\.kemi\\.se/", "https://www.kemi.se/"));
R.rules.push(new Rule("^http://kemi\\.se/", "https://kemi.se/"));
a("kemi.se");
a("www.kemi.se");

R = new RuleSet("KI.se");
R.rules.push(new Rule("^http://bibliometrics\\.ki\\.se/", "https://bibliometrics.ki.se/"));
R.rules.push(new Rule("^http://cas\\.ki\\.se/", "https://cas.ki.se/"));
R.rules.push(new Rule("^http://cwaa\\.ki\\.se/", "https://cwaa.ki.se/"));
R.rules.push(new Rule("^http://child3\\.ki\\.se/", "https://child3.ki.se/"));
R.rules.push(new Rule("^http://exjobb\\.meb\\.ki\\.se/", "https://exjobb.meb.ki.se/"));
R.rules.push(new Rule("^http://fonder\\.ki\\.se/", "https://fonder.ki.se/"));
R.rules.push(new Rule("^http://kib\\.ki\\.se/", "https://kib.ki.se/"));
R.rules.push(new Rule("^http://metasearch\\.kib\\.ki\\.se/", "https://metasearch.kib.ki.se/"));
a("bibliometrics.ki.se");
a("cas.ki.se");
a("cwaa.ki.se");
a("child3.ki.se");
a("exjobb.meb.ki.se");
a("fonder.ki.se");
a("kib.ki.se");
a("metasearch.kib.ki.se");

R = new RuleSet("KKH-Allianz");
R.rules.push(new Rule("^http://(?:www\\.)?kkh-allianz\\.de/", "https://www.kkh-allianz.de/"));
a("www.kkh-allianz.de");
a("kkh-allianz.de");

R = new RuleSet("KKH.se");
R.rules.push(new Rule("^http://kkh\\.se/", "https://kkh.se/"));
R.rules.push(new Rule("^http://www\\.kkh\\.se/", "https://www.kkh.se/"));
a("www.kkh.se");
a("kkh.se");

R = new RuleSet("KLM");
R.rules.push(new Rule("^http://klm\\.com/", "https://www.klm.com/"));
R.rules.push(new Rule("^http://(mobile|www)\\.klm\\.com/", "https://$1.klm.com/"));
a("klm.com");
a("*.klm.com");

R = new RuleSet("KMH.se");
R.rules.push(new Rule("^http://kmh\\.se/", "https://www.kmh.se/"));
R.rules.push(new Rule("^http://www\\.kmh\\.se/", "https://www.kmh.se/"));
a("www.kmh.se");
a("kmh.se");

R = new RuleSet("KPN");
R.rules.push(new Rule("^http://(?:www\\.)?kpn\\.(?:com|nl)/", "https://www.kpn.com/"));
a("kpn.com");
a("*.kpn.com");
a("kpn.nl");
a("*.kpn.nl");

R = new RuleSet("KPT.ch");
R.rules.push(new Rule("^http://(?:www\\.)?kpt\\.ch/", "https://www.kpt.ch/"));
a("kpt.ch");
a("www.kpt.ch");

R = new RuleSet("KTH.se");
R.rules.push(new Rule("^http://kth\\.se/", "https://www.kth.se/"));
R.rules.push(new Rule("^http://www\\.kth\\.se/", "https://www.kth.se/"));
R.rules.push(new Rule("^http://intra\\.kth\\.se/", "https://intra.kth.se/"));
a("kth.se");
a("www.kth.se");
a("intra.kth.se");

R = new RuleSet("KYPS.net");
R.rules.push(new Rule("^http://(www\\.)?kyps\\.net/", "https://kyps.net/"));
a("kyps.net");
a("www.kyps.net");

R = new RuleSet("Kabel Deutschland");
R.rules.push(new Rule("^http://(?:www\\.)?kabeldeutschland\\.de/", "https://www.kabeldeutschland.de/"));
a("kabeldeutschland.de");
a("www.kabeldeutschland.de");

R = new RuleSet("Kachingle");
R.rules.push(new Rule("^http://kachingle\\.com/", "https://kachingle.com/"));
R.rules.push(new Rule("^http://(www|downloads|assets|medallion)\\.kachingle\\.com/", "https://$1.kachingle.com/"));
a("kachingle.com");
a("www.kachingle.com");
a("downloads.kachingle.com");
a("assets.kachingle.com");
a("medallion.kachingle.com");

R = new RuleSet("Kampyle (partial)");
R.rules.push(new Rule("^https?://kampyle\\.com/", "https://www.kampyle.com/"));
R.rules.push(new Rule("^http://www\\.kampyle\\.com/(feedback_form/|images/|login|logos/|min/|static/|test/)", "https://www.kampyle.com/$1"));
a("kampyle.com");
a("www.kampyle.com");

R = new RuleSet("Kangurum");
R.rules.push(new Rule("^http://(www\\.)?kangurum\\.com\\.tr/", "https://www.kangurum.com.tr/"));
a("www.kangurum.com.tr");
a("kangurum.com.tr");

R = new RuleSet("Kapt Cha");
R.rules.push(new Rule("^http://ssl\\.kaptcha\\.com/", "https://ssl.kaptcha.com/"));
a("ssl.kaptcha.com");

R = new RuleSet("Karagarga");
R.rules.push(new Rule("^http://(?:www\\.)?karagarga\\.net/", "https://karagarga.net/"));
a("karagarga.net");
a("www.karagarga.net");

R = new RuleSet("Karwansaray Publishers");
R.rules.push(new Rule("^http://(?:www\\.)?karwansaraypublishers\\.com/", "https://karwansaraypublishers.com/"));
a("karwansaraypublishers.com");
a("*.karwansaraypublishers.com");

R = new RuleSet("Kayak");
R.rules.push(new Rule("^http://(?:www\\.)?kayak\\.com/", "https://www.kayak.com/"));
a("kayak.com");
a("www.kayak.com");

R = new RuleSet("Keepassx");
R.rules.push(new Rule("^http://(www\\.)?keepassx\\.org/", "https://www.keepassx.org/"));
a("www.keepassx.org");
a("keepassx.org");

R = new RuleSet("Kei.pl (partial)");
R.rules.push(new Rule("^http://(www\\.)?kei\\.pl/(favicon\\.ico$|css/|gfx/|swf/)", "https://www.kei.pl/$2"));
R.rules.push(new Rule("^http://panel\\.kei\\.pl/", "https://panel.kei.pl/"));
a("kei.pl");
a("panel.kei.pl");
a("www.kei.pl");

R = new RuleSet("Kelley Blue Book Co.");
R.rules.push(new Rule("^http://(s1\\.|www\\.)?kbb\\.com/", "https://$1kbb.com/"));
R.rules.push(new Rule("^http://file\\.k(?:bb|elleybluebookimages)\\.com/", "https://file.kbb.com/"));
a("kbb.com");
a("*.kbb.com");
a("file.kelleybluebookimages.com");

R = new RuleSet("Kernel.org");
R.rules.push(new Rule("^http://kernel\\.org/", "https://www.kernel.org/"));
R.rules.push(new Rule("^http://((www|ftp|pub|all|eu|boot|accounts|patchwork|bugzilla|userweb)\\.kernel\\.org)/", "https://$1/"));
R.rules.push(new Rule("^http://(([a-zA-Z0-9-]+\\.)?(git|wiki)\\.kernel\\.org)/", "https://$1/"));
a("kernel.org");
a("*.kernel.org");
a("*.git.kernel.org");
a("*.wiki.kernel.org");

R = new RuleSet("KeyDrive (partial)");
R.rules.push(new Rule("^http://help\\.moniker\\.com/", "https://support.snapnames.com/"));
R.rules.push(new Rule("^http://(domainauctions\\.|www\\.)?moniker\\.com/", "https://$1moniker.com/"));
R.rules.push(new Rule("^http://(moniker\\.|www\\.)?snapnames\\.com/", "https://moniker.snapnames.com/"));
a("moniker.com");
a("*.moniker.com");
a("snapnames.com");
a("*.snapnames.com");

R = new RuleSet("Keyerror.com");
R.rules.push(new Rule("^http://(www\\.)?keyerror\\.com/", "https://keyerror.com/"));
a("keyerror.com");
a("www.keyerror.com");

R = new RuleSet("Khan Academy");
R.rules.push(new Rule("^http://(?:www\\.)?khanacademy\\.org/", "https://khan-academy.appspot.com/"));
a("khamacademy.org");
a("www.khamacademy.org");
a("khan-academy.appspot.com");

R = new RuleSet("Khronos Group (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?khronos\\.org/registry/(.+)/specs/", "https://www.khronos.org/registry/$1/specs/"));
a("khronos.org");
a("www.khronos.org");

R = new RuleSet("KickassTorrents");
R.rules.push(new Rule("^http://(?:www\\.)?kat\\.ph/", "https://kat.ph/"));
R.rules.push(new Rule("^http://(?:www\\.)?kickasstorrents\\.com/", "https://kat.ph/"));
R.rules.push(new Rule("^http://kastatic\\.com/", "https://kastatic.com/"));
a("kat.ph");
a("*.kat.ph");
a("kickasstorrents.com");
a("www.kickasstorrents.com");
a("kastatic.com");

R = new RuleSet("Kickstarter (partial)");
R.rules.push(new Rule("^http://kickstarter\\.com/", "https://www.kickstarter.com/"));
R.rules.push(new Rule("^http://www\\.kickstarter\\.com/(fonts/|login|signup)", "https://www.kickstarter.com/$1"));
a("kickstarter.com");
a("www.kickstarter.com");

R = new RuleSet("KidsHealth/TeensHealth");
R.rules.push(new Rule("^http://(secure02|websrv01)\\.kidshealth\\.org/", "https://$1.kidshealth.org/"));
R.rules.push(new Rule("^http://(www\\.)?kidshealth\\.org/", "https://secure02.kidshealth.org/"));
R.rules.push(new Rule("^http://(www\\.)?teenshealth\\.org/?$", "https://secure02.kidshealth.org/teen/"));
R.rules.push(new Rule("^http://(www\\.)?teenshealth\\.org/([^?]+)", "https://secure02.kidshealth.org/$2"));
a("kidshealth.org");
a("secure02.kidshealth.org");
a("websrv01.kidshealth.org");
a("www.kidshealth.org");
a("teenshealth.org");
a("www.teenshealth.org");

R = new RuleSet("Kintera Network");
R.rules.push(new Rule("^(http://(www\\.)?|https://)kintera\\.org/", "https://www.kintera.org/"));
R.rules.push(new Rule("^http://([-a-zA-Z0-9_]+\\.)?([-a-zA-Z0-9_]+)\\.kintera\\.org/([^/]+/[^/]){1}", "https://www.kintera.org/$3"));
R.rules.push(new Rule("^(http://(www\\.)?|https://)kintera\\.com/", "https://www.kintera.com/"));
a("kintera.org");
a("*.kintera.org");
a("www.*.kintera.org");
a("kintera.com");
a("www.kintera.com");

R = new RuleSet("Kismetwireless.net");
R.rules.push(new Rule("^http://(?:www\\.)?kismetwireless\\.net/", "https://kismetwireless.net/"));
a("kismetwireless.net");
a("www.kismetwireless.net");

R = new RuleSet("Kitapyurdu");
R.rules.push(new Rule("^http://(www\\.)?kitapyurdu\\.com/", "https://www.kitapyurdu.com/"));
a("www.kitapyurdu.com");
a("kitapyurdu.com");

R = new RuleSet("Knappschaft-Bahn-See");
R.rules.push(new Rule("^http://(?:www\\.)?kbs\\.de/", "https://www.kbs.de/"));
a("www.kbs.de");
a("kbs.de");

R = new RuleSet("Kohls.com");
R.rules.push(new Rule("^http://kohls\\.com/", "https://www.kohls.com/"));
R.rules.push(new Rule("^http://www\\.kohls\\.com/", "https://www.kohls.com/"));
a("kohls.com");
a("www.kohls.com");

R = new RuleSet("Kommunal.se");
R.rules.push(new Rule("^http://kommunal\\.se/", "https://www.kommunal.se/"));
R.rules.push(new Rule("^http://www\\.kommunal\\.se/", "https://www.kommunal.se/"));
a("kommunal.se");
a("www.kommunal.se");

R = new RuleSet("Komplett.no");
R.rules.push(new Rule("^http://(?:www\\.)?komplett\\.no/", "https://www.komplett.no/"));
a("komplett.no");
a("www.komplett.no");

R = new RuleSet("Konami.com");
R.rules.push(new Rule("^http://konami\\.com/", "https://www.konami.com/"));
R.rules.push(new Rule("^http://www\\.konami\\.com/", "https://www.konami.com/"));
a("konami.com");
a("www.konami.com");

R = new RuleSet("Konstfack.se");
R.rules.push(new Rule("^http://konstfack\\.se/", "https://www.konstfack.se/"));
R.rules.push(new Rule("^http://www\\.konstfack\\.se/", "https://www.konstfack.se/"));
a("www.konstfack.se");
a("konstfack.se");

R = new RuleSet("Kotex");
R.rules.push(new Rule("^http://(?:www\\.)?kotex\\.com/", "https://www.kotex.com/"));
R.rules.push(new Rule("^http://dare\\.kotex\\.com/", "https://dare.kotex.com/"));
a("kotex.com");
a("www.kotex.com");
a("dare.kotex.com");

R = new RuleSet("krebsonsecurity.com");
R.rules.push(new Rule("^http://www\\.krebsonsecurity\\.com/", "https://krebsonsecurity.com/"));
R.rules.push(new Rule("^http://krebsonsecurity\\.com/", "https://krebsonsecurity.com/"));
a("krebsonsecurity.com");
a("www.krebsonsecurity.com");

R = new RuleSet("KriminalVarden.se");
R.rules.push(new Rule("^http://www\\.kriminalvarden\\.se/", "https://www.kriminalvarden.se/"));
R.rules.push(new Rule("^http://kriminalvarden\\.se/", "https://www.kriminalvarden.se/"));
a("kriminalvarden.se");
a("www.kriminalvarden.se");

R = new RuleSet("Kryptronic (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?kryptronic\\.com/", "https://$1kryptronic.com/"));
R.exclusions.push(new Exclusion("^http://(forum|wiki)\\."));
a("kryptronic.com");
a("*.kryptronic.com");

R = new RuleSet("Kuantokusta.pt");
R.rules.push(new Rule("^http://(?:www\\.)?kuantokusta\\.pt/", "https://www.kuantokusta.pt/"));
a("kuantokusta.pt");
a("www.kuantokusta.pt");

R = new RuleSet("Kung Fu Store (partial)");
R.rules.push(new Rule("^http://kungfu(nation|store)\\.com/", "https://kungfu$1.com/"));
R.rules.push(new Rule("^http://(\\w\\W)\\.kungfu(nation|store)\\.com/(cart$|favicon\\.ico$|login$|(image|stylesheet|theme)s/|(session|user)/\\w+|store/)", "https://$1.kungfu$2.com/$3"));
a("kungfunation.com");
a("*.kungfunation.com");
a("kungfustore.com");
a("*.kungfustore.com");

R = new RuleSet("kuro5hin.org");
R.rules.push(new Rule("^http://kuro5hin\\.org/", "https://www.kuro5hin.org/"));
R.rules.push(new Rule("^http://www\\.kuro5hin\\.org/", "https://www.kuro5hin.org/"));
a("kuro5hin.org");
a("www.kuro5hin.org");

R = new RuleSet("Kuther.net");
R.rules.push(new Rule("^http://(www\\.)?kuther\\.net/", "https://kuther.net/"));
a("kuther.net");
a("www.kuther.net");

R = new RuleSet("KwikSurveys");
R.rules.push(new Rule("^http://(www\\.)?kwiksurveys\\.com/", "https://$1kwiksurveys.com/"));
a("kwiksurveys.com");
a("www.kwiksurveys.com");

R = new RuleSet("Kyberia.sk");
R.rules.push(new Rule("^http://(?:www\\.)?kyberia\\.sk/", "https://kyberia.sk/"));
a("www.kyberia.sk");
a("kyberia.sk");

R = new RuleSet("Local 20/20");
R.rules.push(new Rule("^http://(www\\.)?l2020\\.org/", "https://l2020.org/"));
a("l2020.org");
a("www.l2020.org");

R = new RuleSet("LINBIT");
R.rules.push(new Rule("^http://(www\\.)?linbit\\.com/", "https://www.linbit.com/"));
a("linbit.com");
a("www.linbit.com");

R = new RuleSet("LIU.se");
R.rules.push(new Rule("^http://liu\\.se/", "https://www.liu.se/"));
R.rules.push(new Rule("^http://www\\.liu\\.se/", "https://www.liu.se/"));
R.rules.push(new Rule("^http://www\\.ida\\.liu\\.se/", "https://www.ida.liu.se/"));
R.rules.push(new Rule("^http://www\\.imh\\.liu\\.se/", "https://www.imh.liu.se/"));
R.rules.push(new Rule("^http://www\\.ibl\\.liu\\.se/", "https://www.ibl.liu.se/"));
R.rules.push(new Rule("^http://www\\.isv\\.liu\\.se/", "https://www.isv.liu.se/"));
R.rules.push(new Rule("^http://www\\.hu\\.liu\\.se/", "https://www.hu.liu.se/"));
R.rules.push(new Rule("^http://www\\.isak\\.liu\\.se/", "https://www.isak.liu.se/"));
R.rules.push(new Rule("^http://www\\.lith\\.liu\\.se/", "https://www.lith.liu.se/"));
R.rules.push(new Rule("^http://www\\.student\\.liu\\.se/", "https://www.student.liu.se/"));
R.rules.push(new Rule("^http://www\\.tema\\.liu\\.se/", "https://www.tema.liu.se/"));
a("www.liu.se");
a("liu.se");
a("www.hu.liu.se");
a("www.imh.liu.se");
a("www.ibl.liu.se");
a("www.isv.liu.se");
a("www.isak.liu.se");
a("www.lith.liu.se");
a("www.student.liu.se");
a("www.tema.liu.se");
a("www.ida.liu.se");

R = new RuleSet("LKML");
R.rules.push(new Rule("^http://(?:www\\.)?lkml\\.org/", "https://lkml.org/"));
a("lkml.org");
a("www.lkml.org");

R = new RuleSet("LM Uni Muenchen");
R.rules.push(new Rule("^http://(?:www\\.)?uni-muenchen\\.de/", "https://www.uni-muenchen.de/"));
R.rules.push(new Rule("^http://uni-muenchen\\.de/", "https://www.uni-muenchen.de/"));
a("uni-muenchen.de");
a("*.uni-muenchen.de");

R = new RuleSet("Lone Star Overnight");
R.rules.push(new Rule("^http://(?:www\\.)?lso\\.com/", "https://www.lso.com/"));
a("lso.com");
a("www.lso.com");

R = new RuleSet("LWN");
R.rules.push(new Rule("^http://(?:www\\.)?lwn\\.net/", "https://lwn.net/"));
a("lwn.net");
a("www.lwn.net");

R = new RuleSet("La Caixa");
R.rules.push(new Rule("^http://lacaixa\\.es/", "https://lacaixa.es/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.lacaixa\\.es/", "https://$1.lacaixa.es/"));
a("lacaixa.es");
a("*.lacaixa.es");

R = new RuleSet("LabCorp");
R.rules.push(new Rule("^(http://(www\\.)?|https://)labcorp\\.com/", "https://www.labcorp.com/"));
R.rules.push(new Rule("^http://(datalink2|hypersend|www[3-4]?)\\.labcorp\\.com/", "https://$1.labcorp.com/"));
R.rules.push(new Rule("^(http://(www\\.)?|https://)labcorpsolutions\\.com/", "https://www.labcorpsolutions.com/"));
a("labcorp.com");
a("datalink2.labcorp.com");
a("hypersend.labcorp.com");
a("www.labcorp.com");
a("www3.labcorp.com");
a("www4.labcorp.com");
a("labcorpsolutions.com");
a("www.labcorpsolutions.com");

R = new RuleSet("Lansforsakringar.se");
R.rules.push(new Rule("^http://www\\.lansforsakringar\\.se/", "https://www.lansforsakringar.se/"));
R.rules.push(new Rule("^http://www1\\.lansforsakringar\\.se/", "https://www1.lansforsakringar.se/"));
R.rules.push(new Rule("^http://lansforsakringar\\.se/", "https://www.lansforsakringar.se/"));
a("lansforsakringar.se");
a("www.lansforsakringar.se");
a("www1.lansforsakringar.se");

R = new RuleSet("Lantmateriet.se");
R.rules.push(new Rule("^http://www\\.lantmateriet\\.se/", "https://www.lantmateriet.se/"));
R.rules.push(new Rule("^http://lantmateriet\\.se/", "https://www.lantmateriet.se/"));
a("lantmateriet.se");
a("www.lantmateriet.se");

R = new RuleSet("Lastminute.com");
R.rules.push(new Rule("^http://(?:www\\.)?lastminute\\.com/", "https://www.lastminute.com/"));
a("www.lastminute.com");
a("lastminute.com");

R = new RuleSet("Launchpad");
R.rules.push(new Rule("^http://launchpad\\.net/", "https://launchpad.net/"));
R.rules.push(new Rule("^https?://bazaar\\.launchpad\\.net/$", "https://launchpad.net/"));
R.rules.push(new Rule("^http://bazaar\\.launchpad\\.net/(.+)", "https://bazaar.launchpad.net/$1"));
R.rules.push(new Rule("^http://(answers|api|blueprints|bugs|code|dev|help|librarian|lists|login|((bugs\\.)?(qa)?staging)|(login\\.staging)|translations|www)\\.launchpad\\.net/", "https://$1.launchpad.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?launchpadlibrarian\\.net/", "https://launchpadlibrarian.net/"));
R.rules.push(new Rule("^http://((([a-zA-Z0-9\\-]+\\.restricted\\.)?qa)?staging)\\.launchpadlibrarian\\.net/", "https://$1.launchpadlibrarian.net/"));
a("launchpad.net");
a("*.launchpad.net");
a("bugs.qastaging.launchpad.net");
a("bugs.staging.launchpad.net");
a("login.staging.launchpad.net");
a("launchpadlibrarian.net");
a("qastaging.launchpadlibrarian.net");
a("*.restricted.qastaging.launchpadlibrarian.net");
a("staging.launchpadlibrarian.net");
a("www.launchpadlibrarian.net");

R = new RuleSet("Lavabit");
R.rules.push(new Rule("^http://(?:www\\.)?lavabit\\.com/", "https://lavabit.com/"));
R.rules.push(new Rule("^http://(click|hosting)\\.lavabit\\.com/", "https://$1.lavabit.com/"));
a("lavabit.com");
a("www.lavabit.com");
a("click.lavabit.com");
a("hosting.lavabit.com");

R = new RuleSet("Lavasoft");
R.rules.push(new Rule("^http://lavasoft\\.com/", "https://secure.lavasoft.com/"));
R.rules.push(new Rule("^http://www\\.lavasoft\\.com/", "https://secure.lavasoft.com/"));
a("lavasoft.com");
a("www.lavasoft.com");

R = new RuleSet("LboroAcUk");
R.rules.push(new Rule("^http://(bestmaths|dspace|email(admin)?|engskills|lists|luis|lorls|oss|pdwww|wfa)\\.lboro\\.ac\\.uk/", "https://$1.lboro.ac.uk/"));
a("*.lboro.ac.uk");

R = new RuleSet("Ledgerscope.net");
R.rules.push(new Rule("^http://(www\\.)?ledgerscope\\.net/", "https://www.ledgerscope.net/"));
a("ledgerscope.net");
a("www.ledgerscope.net");

R = new RuleSet("Leechaccess");
R.rules.push(new Rule("^http://(www\\.)?leechaccess\\.com/", "https://$1leechaccess.com/"));
a("leechaccess.com");
a("www.leechaccess.com");

R = new RuleSet("Life Extension Magazine");
R.rules.push(new Rule("^http://(www\\.)?lef\\.org/", "https://www.lef.org/"));
a("www.lef.org");
a("lef.org");

R = new RuleSet("Legacy.com (partial)");
R.rules.push(new Rule("^http://legacy\\.com/", "https://www.legacy.com/"));
R.rules.push(new Rule("^http://www\\.legacy\\.com/($|Images/|([\\w\\-/]+)*(images/|ObitsTileCorner\\.axd)|ns/|NS/|OBITUARIES/)", "https://www.legacy.com/$1"));
R.rules.push(new Rule("^http://(?:mi|(mi-)?static)\\.legacy\\.com/", "https://www.legacy.com/"));
R.rules.push(new Rule("^http://mi-cache\\.legacy\\.com/", "https://cache.legacy.com/"));
a("legacy.com");
a("*.legacy.com");

R = new RuleSet("LegitScript");
R.rules.push(new Rule("^http://(?:www\\.)?legitscript\\.com/", "https://secure.legitscript.com/"));
a("www.legitscript.com");
a("legitscript.com");

R = new RuleSet("Lelo.com");
R.rules.push(new Rule("^http://lelo\\.com/", "https://lelo.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.lelo\\.com/", "https://$1.lelo.com/"));
a("lelo.com");
a("*.lelo.com");

R = new RuleSet("Lenos Softwarse (partial)");
R.rules.push(new Rule("^http://secure\\.lenos\\.com/", "https://secure.lenos.com/"));
a("secure.lenos.com");

R = new RuleSet("Lenovo (partial)");
R.rules.push(new Rule("^http://lenovo\\.com/", "https://www.lenovo.com/"));
R.rules.push(new Rule("^https?://www\\.lenovo\\.com/epp$", "https://www.lenovo.com/epp/"));
R.rules.push(new Rule("^http://(outlet|shop|www)\\.lenovo\\.com/", "https://$1.lenovo.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?lenovo\\.co\\.uk/?$", "https://www.lenovo.com/uk/en/"));
R.rules.push(new Rule("^http://(www\\.)?lenovoorders\\.com/", "https://$1lenovoorders.com/"));
R.rules.push(new Rule("^https://www\\.lenovo\\.com/(support|training)/", "http://www.lenovo.com/$1/"));
R.rules.push(new Rule("^https://(blog|(consumer)?support|news|social)\\.lenovo\\.com/", "http://$1.lenovo.com/"));
R.exclusions.push(new Exclusion("^http://lenovo\\.com/friendsandfamily$"));
R.exclusions.push(new Exclusion("^http://shop\\.lenovo\\.com/us(/.*)?$"));
R.exclusions.push(new Exclusion("^http://(www\\.)?lenovo\\.com/depotstatus"));
R.exclusions.push(new Exclusion("^http://www\\.lenovo\\.com/(support|training)/"));
a("lenovo.com");
a("blog.lenovo.com");
a("consumersupport.lenovo.com");
a("news.lenovo.com");
a("outlet.lenovo.com");
a("shop.lenovo.com");
a("social.lenovo.com");
a("support.lenovo.com");
a("www.lenovo.com");
a("lenovo.co.uk");
a("www.lenovo.co.uk");
a("lenovoorders.com");
a("www.lenovoorders.com");

R = new RuleSet("LensRentals.com");
R.rules.push(new Rule("^http://(?:www\\.)?lensrentals\\.com/", "https://www.lensrentals.com/"));
a("www.lensrentals.com");
a("lensrentals.com");

R = new RuleSet("LetsSingIt (partial)");
R.rules.push(new Rule("^http://cdn\\.lsistatic\\.com/", "https://lsi.cachefly.net/"));
a("cdn.lsistatic.com");

R = new RuleSet("Liberty");
R.rules.push(new Rule("^http://(www\\.)?liberty-human-rights\\.org\\.uk/", "https://www.liberty-human-rights.org.uk/"));
a("liberty-human-rights.org.uk");
a("www.liberty-human-rights.org.uk");

R = new RuleSet("Library Anywhere");
R.rules.push(new Rule("^http://(?:www\\.)?libanywhere\\.com/", "https://www.libanywhere.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?syndetics\\.com/", "https://secure.syndetics.com/"));
a("www.libanywhere.com");
a("libanywhere.com");
a("syndetics.com");
a("www.syndetics.com");
a("secure.syndetics.com");

R = new RuleSet("LibraryThing");
R.rules.push(new Rule("^http://(?:www\\.)?librarything\\.com/", "https://www.librarything.com/"));
R.rules.push(new Rule("^http://(pics|static)?\\.librarything\\.com/", "https://$1.librarything.com/"));
a("pics.librarything.com");
a("static.librarything.com");
a("www.librarything.com");
a("librarything.com");

R = new RuleSet("LibreOffice");
R.rules.push(new Rule("^http://(?:www\\.)?libreoffice\\.org/", "https://www.libreoffice.org/"));
a("www.libreoffice.org");
a("libreoffice.org");

R = new RuleSet("LibreOffice-Box");
R.rules.push(new Rule("^http://(?:www\\.)?libreofficebox\\.org/", "https://www.libreofficebox.org/"));
a("libreofficebox.org");
a("www.libreofficebox.org");

R = new RuleSet("LibriVox (partial)");
R.rules.push(new Rule("^http://(catalog\\.)?(www\\.)?librivox\\.org/", "https://$1librivox.org/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?librivox\\.org/$"));
R.exclusions.push(new Exclusion("^http://(.*\\.)?librivox\\.org/wp-(images|content)/"));
a("librivox.org");
a("catalog.librivox.org");
a("www.librivox.org");

R = new RuleSet("Lichtblick.de");
R.rules.push(new Rule("^http://(www\\.)?lichtblick\\.de/", "https://www.lichtblick.de/"));
a("www.lichtblick.de");
a("lichtblick.de");

R = new RuleSet("Lidl (partial)");
R.rules.push(new Rule("^http://webforms\\.lidl\\.com/", "https://webforms.lidl.com/"));
a("webforms.lidl.com");

R = new RuleSet("Life in the Fast Lane (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?lifeinthefastlane\\.ca/(favicon\\.ico|wp-content/)", "https://www.lifeinthefastlane.ca/$1"));
a("lifeinthefastlane.ca");
a("www.lifeinthefastlane.ca");

R = new RuleSet("Lifeline Australia");
R.rules.push(new Rule("^(http://(www\\.)?|https://)lifeline\\.org\\.au/", "https://www.lifeline.org.au/"));
a("lifeline.org.au");
a("www.lifeline.org.au");

R = new RuleSet("Liferay.com");
R.rules.push(new Rule("^http://www\\.liferay\\.com/", "https://www.liferay.com/"));
R.rules.push(new Rule("^http://liferay\\.com/", "https://liferay.com/"));
a("www.liferay.com");
a("liferay.com");

R = new RuleSet("LiftShare");
R.rules.push(new Rule("^http://liftshare\\.com/", "https://liftshare.com/"));
R.rules.push(new Rule("^http://(images|www|scripts)\\.liftshare\\.com/", "https://$1.liftshare.com/"));
a("liftshare.com");
a("www.liftshare.com");
a("images.liftshare.com");
a("scripts.liftshare.com");

R = new RuleSet("Liliani");
R.rules.push(new Rule("^http://(?:www\\.)?liliani\\.com\\.br/", "https://www.liliani.com.br/"));
a("liliani.com.br");
a("www.liliani.com.br");

R = new RuleSet("lilliputti.com");
R.rules.push(new Rule("^http://(?:www\\.)?lilliputti\\.com/", "https://lilliputti.com/"));
a("lilliputti.com");
a("www.lilliputti.com");

R = new RuleSet("Linaro (partial)");
R.rules.push(new Rule("^http://(ask|wiki)\\.linaro\\.org/", "https://$1.linaro.org/"));
R.rules.push(new Rule("^http://planet\\.linaro\\.org/openid/", "https://planet.linaro.org/openid/"));
a("ask.linaro.org");
a("planet.linaro.org");
a("wiki.linaro.org");

R = new RuleSet("Lindt USA");
R.rules.push(new Rule("^http://(?:www\\.)?lindtusa\\.com/", "https://www.lindtusa.com/"));
a("www.lindtusa.com");
a("lindtusa.com");

R = new RuleSet("Linerunner (partial)");
R.rules.push(new Rule("^http://f\\.cl\\.ly/", "https://s3.amazonaws.com/f.cl.ly/"));
a("f.cl.ly");

R = new RuleSet("Link+ Catalog");
R.rules.push(new Rule("^http://csul\\.iii\\.com/", "https://csul.iii.com/"));
a("csul.iii.com");

R = new RuleSet("Linksysbycisco.com");
R.rules.push(new Rule("^http://(?:www\\.)?linksysbycisco\\.com/", "https://www.linksysbycisco.com/"));
a("linksysbycisco.com");
a("www.linksysbycisco.com");

R = new RuleSet("Linode");
R.rules.push(new Rule("^http://linode\\.com/", "https://www.linode.com/"));
R.rules.push(new Rule("^http://(library|stats|manager|www)\\.linode\\.com/", "https://$1.linode.com/"));
a("linode.com");
a("*.linode.com");

R = new RuleSet("linutronix");
R.rules.push(new Rule("^http://(www\\.)?linutronix\\.de/", "https://$1linutronix.de/"));
a("linutronix.de");
a("www.linutronix.de");
a("*.www.linutronix.de");

R = new RuleSet("Linux Counter");
R.rules.push(new Rule("^http://(www\\.)?linuxcounter\\.net/", "https://linuxcounter.net/"));
R.rules.push(new Rule("^http://counter\\.li\\.org/", "https://linuxcounter.net/"));
a("counter.li.org");
a("linuxcounter.net");
a("www.linuxcounter.net");

R = new RuleSet("Linux.com");
R.rules.push(new Rule("^http://(?:www\\.)?linux\\.com/", "https://www.linux.com/"));
R.rules.push(new Rule("^http://store\\.linux\\.com/", "https://store.linux.com/"));
R.rules.push(new Rule("^http://video\\.linux\\.com/", "https://video.linux.com/"));
a("linux.com");
a("store.linux.com");
a("www.linux.com");
a("video.linux.com");

R = new RuleSet("Linux.org.ru");
R.rules.push(new Rule("^http://(www\\.)?linux\\.org\\.ru/", "https://www.linux.org.ru/"));
a("www.linux.org.ru");
a("linux.org.ru");

R = new RuleSet("DaLinuxFrenchPage");
R.rules.push(new Rule("^http://(?:www\\.)?linuxfr\\.org/", "https://linuxfr.org/"));
a("linuxfr.org");
a("www.linuxfr.org");

R = new RuleSet("Linux Foundation");
R.rules.push(new Rule("^http://(\\w+\\.)?fossbazaar\\.org/", "https://$1fossbazaar.org/"));
R.rules.push(new Rule("^http://lists\\.fossbazaar\\.org/", "https://lists.fossbazaar.org/"));
R.rules.push(new Rule("^http://(admin|events|ldn|training)\\.linuxfoundation\\.org/", "https://$1.linuxfoundation.org/"));
R.rules.push(new Rule("^http://lists\\.linux-?foundation\\.org/", "https://lists.linuxfoundation.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?spdx\\.org/", "https://spdx.org/"));
R.rules.push(new Rule("^http://lists\\.spdx\\.org/", "https://lists.spdx.org/"));
R.rules.push(new Rule("^http://(www\\.)?yoctoproject\\.org/", "https://$1yoctoproject.org/"));
R.exclusions.push(new Exclusion("^http://spdx\\.org/wiki/"));
a("fossbazaar.org");
a("*.fossbazaar.org");
a("*.linuxfoundation.org");
a("*.linux-foundation.org");
a("spdx.org");
a("*.spdx.org");
a("yoctoproject.org");
a("*.yoctoproject.org");

R = new RuleSet("LinuxMIPS");
R.rules.push(new Rule("^http://(?:www\\.)?linux-mips\\.org/", "https://www.linux-mips.org/"));
a("linux-mips.org");
a("www.linux-mips.org");

R = new RuleSet("LinuxQuestions.org");
R.rules.push(new Rule("^http://(?:www\\.)?linuxquestions\\.org/", "https://www.linuxquestions.org/"));
a("linuxquestions.org");
a("www.linuxquestions.org");

R = new RuleSet("Linx.net");
R.rules.push(new Rule("^http://(www\\.)?linx\\.net/", "https://www.linx.net/"));
a("linx.net");
a("www.linx.net");

R = new RuleSet("Liquid Web");
R.rules.push(new Rule("^http://(www\\.)?liquidweb\\.com/", "https://$1liquidweb.com/"));
R.rules.push(new Rule("^http://media(?:\\.cdn)?\\.liquidweb\\.com/", "https://media.liquidweb.com/"));
a("liquidweb.com");
a("*.liquidweb.com");
a("media.cdn.liquidweb.com");

R = new RuleSet("LiteSpeed Technologies (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?litespeedtech\\.com/static/", "https://store.litespeedtech.com/static/"));
R.rules.push(new Rule("^http://blog\\.litespeedtech\\.com/wp-content/themes/litespeed/litespeed/", "https://store.litespeedtech.com/store/templates/litespeedv4/images/"));
R.rules.push(new Rule("^http://store\\.litespeedtech\\.com/", "https://store.litespeedtech.com/"));
a("litespeedtech.com");
a("store.litespeedtech.com");
a("blog.litespeedtech.com");
a("www.litespeedtech.com");

R = new RuleSet("LiveChat (partial)");
R.rules.push(new Rule("^http://(www\\.)?livechatinc\\.com/(signup|wp-content)/", "https://$1livechatinc.com/$2/"));
R.rules.push(new Rule("^http://app\\.livechatinc\\.com/", "https://app.livechatinc.com/"));
R.rules.push(new Rule("^http://support\\.livechatinc\\.com/", "https://livechat.zendesk.com/"));
R.exclusions.push(new Exclusion("^http://status\\."));
a("livechatinc.com");
a("*.livechatinc.com");
a("livechat.zendesk.com");
a("www.livechat.zendesk.com");

R = new RuleSet("Live Nation Entertainment (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?admission\\.com/(resourc|them)e/", "https://www.admission.com/$1e/"));
R.rules.push(new Rule("^http://(?:www\\.)?billetnet\\.dk/", "https://a248.e.akamai.net/7/248/22942/MNXWEB9-2-3e/www.billetnet.dk/"));
R.rules.push(new Rule("^http://(?:www\\.)?billetnet\\.dk/tm-dkprod\\.112\\.2O7\\.net/", "https://tm-dkprod.112.2o7.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?billetservice\\.no/(assets/|myAccount/|resource/|static/|theme/)", "https://www.billetservice.no/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?billettservice\\.no/tm-noprod\\.112\\.2O7\\.net/", "https://tm-noprod.112.2o7.net/"));
R.rules.push(new Rule("^http://getmein\\.com/", "https://www.getmein.com/"));
R.rules.push(new Rule("^http://(secure|www)\\.getmein\\.com/", "https://$1.getmein.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?lippupalvelu\\.fi/", "https://a248.e.akamai.net/f/19/17391/1d/www.lippupalvelu.fi/"));
R.rules.push(new Rule("^http://(?:www\\.)?lippupalvelu\\.fi/tm-fiprod\\.112\\.2O7\\.net/", "https://tm-fiprod.112.2o7.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?livenation\\.(ae|asia|com\\.au|cz|dk|es|f[ir]|hu|it|no|pl)/", "https://www.livenation.$1/"));
R.rules.push(new Rule("^http://(fr|nl)\\.livenation\\.be/", "https://$1.livenation.be/"));
R.rules.push(new Rule("^http://(?:www\\.)?livenation\\.com/(favicon-ln\\.ico|ln/)", "https://www.livenation.com/$1"));
R.rules.push(new Rule("^http://media\\.livenationinternational\\.com/", "https://a248.e.akamai.net/f/248/905/10m/media.livenationinternational.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticket(?:ek|master)\\.cl/", "https://www.ticketek.cl/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketmaster\\.(ca|com\\.(au|nz|mx)|ie)/favicon-rebrand\\.ico", "https://www.ticketmaster.$1/favicon-rebrand.ico"));
R.rules.push(new Rule("^http://media\\.ticketmaster\\.com/", "https://a248.e.akamai.net/f/248/905/10m/origin.media.ticketmaster.com/"));
R.rules.push(new Rule("^http://mm\\.ticketmaster\\.com/", "https://mm.ticketmaster.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketmaster\\.co\\.uk/(favicon\\.ico|londonpreparesseries)", "https://www.ticketmaster.co.uk/$1"));
R.rules.push(new Rule("^http://media\\.ticketmaster\\.co\\.uk/", "https://a248.e.akamai.net/f/248/905/10m/origin.media.ticketmaster.co.uk/"));
R.rules.push(new Rule("^http://reviews\\.ticketmaster\\.co\\.uk/", "https://a248.e.akamai.net/f/248/905/10m/reviews.ticketmaster.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketmaster\\.de/(resource|myAccount|static|theme)/", "https://www.ticketmaster.de/$1/"));
R.rules.push(new Rule("^http://www\\.ticketmaster\\.de/tm-deprod\\.112\\.2O7\\.net/", "https://tm-deprod.112.2o7.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketmaster\\.(dk|es)/", "https://www.billetnet.$1/"));
R.rules.push(new Rule("^http://media\\.ticketmaster\\.eu/", "https://media.ticketmaster.eu/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketmaster\\.nl/", "https://a248.e.akamai.net/f/248/11802/1d/www.ticketmaster.nl/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketmaster\\.nl/tm-nlprod\\.112\\.2O7\\.net/", "https://tm-nlprod.112.2o7.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketnet\\.fr/(assets|static)/", "https://www.ticketnet.fr/$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketweb\\.com/", "https://www.ticketweb.com/"));
R.rules.push(new Rule("^http://i\\.ticketweb\\.com/", "https://a248.e.akamai.net/f/248/15404/24h/i.ticketweb.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?ticketweb\\.co\\.uk/(images/|INFO/|giftcards|member|partners/|section/|styles\\.css|twpurple\\.html|ukcontent\\.css|user/gb_northeast/order/|venuepages/|[\\w\\-\\./]+\\.html$|[\\w\\-]+/artist/\\d+)", "https://www.ticketweb.co.uk/$1"));
a("admission.com");
a("www.admission.com");
a("billetnet.dk");
a("www.billetnet.dk");
a("billetservice.no");
a("www.billetservice.no");
a("getmein.com");
a("*.getmein.com");
a("lippupalvelu.fi");
a("www.lippupalvelu.fi");
a("livenation.*");
a("www.livenation.*");
a("*.livenation.be");
a("ticketek.cl");
a("www.ticketek.cl");
a("ticketmaster.*");
a("www.ticketmaster.*");
a("*.ticketmaster.com");
a("*.ticketmaster.co.uk");
a("media.ticketmaster.eu");
a("ticketweb.*");
a("*.ticketweb.com");
a("www.ticketweb.co.uk");

R = new RuleSet("Hotmail / Live");
R.rules.push(new Rule("^http://(login|onecare|signup|mail)\\.live\\.com/", "https://$1.live.com/"));
R.rules.push(new Rule("^http://secure\\.(\\w+)\\.live\\.com/", "https://secure.$1.live.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.login\\.live\\.com/", "https://$1.login.live.com/"));
R.rules.push(new Rule("^http://accountservices\\.passport\\.net/", "https://accountservices.passport.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?hotmail\\.com/", "https://www.hotmail.com/"));
R.rules.push(new Rule("^http://[^@:/\\.]+\\.([^@:/\\.]+)\\.mail\\.live\\.com/", "https://$1.mail.live.com/"));
a("hotmail.com");
a("*.hotmail.com");
a("*.live.com");
a("*.login.live.com");
a("secure.*.live.com");

R = new RuleSet("LiveJournal (partial)");
R.rules.push(new Rule("^http://(www\\.)?livejournal\\.com/((changepassword|create|login)\\.html|img/|manage/|shop/|stc/)", "https://$1livejournal.com/$2"));
R.rules.push(new Rule("^http://status\\.livejournal\\.com/img/", "https://s3.amazonaws.com/status-livejournal/img/"));
R.rules.push(new Rule("^https?://(?:l-)stat\\.livejournal\\.com/img/error-pages/(bg-error-page\\.jpg|bullet-round-grey\\.gif|frank\\.png|logo-lj\\.png|rule-grey\\.gif)", "https://s3.amazonaws.com/status-livejournal/img/$1"));
R.rules.push(new Rule("^https?://(?:l-)?stat\\.livejournal\\.com/", "https://stat.livejournal.com/"));
a("livejournal.com");
a("stat.livejournal.com");
a("l-stat.livejournal.com");
a("status.livejournal.com");
a("www.livejournal.com");

R = new RuleSet("LivePerson (partial)");
R.rules.push(new Rule("^http://hc2\\.humanclick\\.com/", "https://hc2.humanclick.com/"));
R.rules.push(new Rule("^http://liveperson\\.net/", "https://www.liveperson.net/"));
R.rules.push(new Rule("^http://(base|community|customercenter|server\\.iad|solutions|sr2|www)\\.liveperson\\.net/", "https://$1.liveperson.net/"));
R.rules.push(new Rule("^http://liveperson\\.hosted\\.jivesoftware\\.com/", "https://community.liveperson.net/"));
a("hc2.humanclick.com");
a("liveperson.hosted.jivesoftware.com");
a("liveperson.net");
a("*.liveperson.net");
a("*.iad.liveperson.net");

R = new RuleSet("Livestrong (partial)");
R.rules.push(new Rule("^http://(blog\\.|www\\.)?livestrong\\.org/", "https://$1livestrong.org/"));
a("livestrong.org");
a("*.livestrong.org");

R = new RuleSet("LivingSocial (partial)");
R.rules.push(new Rule("^http://(corporate\\.|www\\.)?livingsocial\\.com/", "https://$1livingsocial.com/"));
R.rules.push(new Rule("^http://help\\.livingsocial\\.com/", "https://help.livingsocial.com/"));
R.rules.push(new Rule("^http://help\\.livingsocial\\.co\\.uk/(image|stylesheet)s/", "https://help.livingsocial.com/$1s/"));
R.rules.push(new Rule("^http://a\\d\\.ak\\.lscdn\\.net/", "https://a248.e.akamai.net/si.lscdn.net/"));
a("livingsocial.com");
a("*.livingsocial.com");
a("help.livingsocial.co.uk");
a("*.ak.lscdn.net");

R = new RuleSet("LoadImpact.com");
R.rules.push(new Rule("^http://www\\.loadimpact\\.com/", "https://www.loadimpact.com/"));
R.rules.push(new Rule("^http://loadimpact\\.com/", "https://loadimpact.com/"));
a("loadimpact.com");
a("www.loadimpact.com");

R = new RuleSet("Local.ch");
R.rules.push(new Rule("^http://(?:www\\.)?local\\.ch/", "https://www.local.ch/"));
R.rules.push(new Rule("^http://auto\\.local\\.ch/", "https://auto.local.ch/"));
R.rules.push(new Rule("^http://blog\\.local\\.ch/", "https://blog.local.ch/"));
R.rules.push(new Rule("^http://developer\\.local\\.ch/", "https://developer.local.ch/"));
R.rules.push(new Rule("^http://guide\\.local\\.ch/", "https://guide.local.ch/"));
R.rules.push(new Rule("^http://id\\.local\\.ch/", "https://id.local.ch/"));
R.rules.push(new Rule("^http://immo\\.local\\.ch/", "https://immo.local.ch/"));
R.rules.push(new Rule("^http://info\\.local\\.ch/", "https://info.local.ch/"));
R.rules.push(new Rule("^http://map\\.local\\.ch/", "https://map.local.ch/"));
R.rules.push(new Rule("^http://market\\.local\\.ch/", "https://market.local.ch/"));
R.rules.push(new Rule("^http://my\\.local\\.ch/", "https://my.local.ch/"));
R.rules.push(new Rule("^http://news\\.local\\.ch/", "https://news.local.ch/"));
R.rules.push(new Rule("^http://tel\\.local\\.ch/", "https://tel.local.ch/"));
R.rules.push(new Rule("^http://yellow\\.local\\.ch/", "https://yellow.local.ch/"));
a("local.ch");
a("www.local.ch");
a("auto.local.ch");
a("blog.local.ch");
a("developer.local.ch");
a("guide.local.ch");
a("id.local.ch");
a("immo.local.ch");
a("info.local.ch");
a("map.local.ch");
a("market.local.ch");
a("my.local.ch");
a("news.local.ch");
a("tel.local.ch");
a("yellow.local.ch");

R = new RuleSet("LogMeIn.com (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?boldchat\\.com/", "https://www.boldchat.com/"));
R.rules.push(new Rule("^http://(images|livechat|vms|web)\\.boldchat\\.com/", "https://$1.boldchat.com/"));
R.rules.push(new Rule("^http://(?:secure\\.|www\\.)?(joinme\\.me|(logmein(rescue)?|remotelyanywhere)\\.com)/", "https://secure.$1/"));
R.rules.push(new Rule("^http://(content|investor)?\\.logmein\\.com/", "https://$1.logmein.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?remotelyanywhere\\.com/$", "https://secure.remotelyanywhere.com/template.asp?page=home"));
R.rules.push(new Rule("^http://(?:www\\.)?remotelyanywhere\\.com/(.+)", "https://secure.remotelyanywhere.com/$1"));
a("boldchat.com");
a("*.boldchat.com");
a("join.me");
a("*.join.me");
a("logmein.com");
a("*.logmein.com");
a("*.investor.logmein.com");
a("logmeinrescue.com");
a("*.logmeinrescue.com");
a("remotelyanywhere.com");
a("*.remotelyanywhere.com");

R = new RuleSet("Logentries.com");
R.rules.push(new Rule("^http://logentries\\.com/", "https://logentries.com/"));
R.rules.push(new Rule("^http://www\\.logentries\\.com/", "https://www.logentries.com/"));
a("logentries.com");
a("www.logentries.com");

R = new RuleSet("London 2012");
R.rules.push(new Rule("^http://london2012\\.com/", "https://www.london2012.com/"));
R.rules.push(new Rule("^http://getset\\.london2012\\.com/", "https://getset.london2012.com/"));
R.rules.push(new Rule("^http://www\\.festival\\.london2012\\.com/", "https://festival.london2002.com/"));
R.rules.push(new Rule("^http://(shop|www)\\.london2012\\.com/", "https://$1.london2012.com/"));
R.rules.push(new Rule("^http://tickets\\.london2012\\.com/", "https://www.tickets.london2012.com/"));
R.rules.push(new Rule("^http://www\\.tickets\\.london2012\\.com/member", "https://www.tickets.london2012.com/member"));
R.exclusions.push(new Exclusion("^http://getset\\.london2012\\.com/((cy|en)/(home)?)?$"));
a("london2012.com");
a("*.london2012.com");
a("www.festival.london2012.com");
a("tickets.london2012.com");
a("www.tickets.london2012.com");

R = new RuleSet("London School of Economics (partial)");
R.rules.push(new Rule("^http://www2\\.lse\\.ac\\.uk/(ImagesForExternalHomepage|SiteElements|v4global)/", "https://www2.lse.ac.uk/$1/"));
a("www2.lse.ac.uk");

R = new RuleSet("London Stock Exchange (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?londonstockexchange\\.com/(exchange/user|global|home|media|news)/", "https://www.londonstockexchange.com/$1/"));
a("londonstockexchange.com");
a("www.londonstockexchange.com");

R = new RuleSet("LongTail (partial)");
R.rules.push(new Rule("^http://(www\\.)?longtailvideo\\.com/(content|jw)/", "https://www.longtailvideo.com/$2/"));
R.rules.push(new Rule("^http://(dashboard|plugins)\\.longtailvideo\\.com/", "https://$1.longtailvideo.com/"));
R.rules.push(new Rule("^http://s(\\d)-www\\.ltvimg\\.com/", "https://s$1-www.ltvimg.com/"));
a("longtailvideo.com");
a("dashboard.longtailvideo.com");
a("plugins.longtailvideo.com");
a("www.longtailvideo.com");
a("s0-www.ltvimg.com");
a("s1-www.ltvimg.com");

R = new RuleSet("Loopt");
R.rules.push(new Rule("^http://(?:www\\.)?loopt\\.com/", "https://www.loopt.com/"));
a("loopt.com");
a("www.loopt.com");

R = new RuleSet("LoveFilm");
R.rules.push(new Rule("^http://(?:www\\.)?lovefilm\\.co\\.uk/", "https://www.lovefilm.com/"));
R.rules.push(new Rule("^http://(www\\.)?lovefilm\\.(com|de|dk|no|se)/", "https://www.lovefilm.$2/"));
R.rules.push(new Rule("^http://static\\.lovefilm\\.(com|de|dk|no|se)/", "https://static.lovefilm.$1/"));
a("www.lovefilm.*");
a("static.lovefilm.*");
a("lovefilm.*");

R = new RuleSet("Lovemoney.com (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?love(food|money)\\.com/(css|favicon\\.ico|[iI]mages/|login/)", "https://www.love$1.com/$2"));
R.rules.push(new Rule("^http://energy\\.lovemoney\\.com/Branding/", "https://energy.lovemoney.com/Branding/"));
R.rules.push(new Rule("^http://sanalytics\\.lovemoney\\.com/", "https://sanalytics.lovemoney.com/"));
a("lovefood.com");
a("www.lovefood.com");
a("lovemoney.com");
a("*.lovemoney.com");

R = new RuleSet("Ludios.org");
R.rules.push(new Rule("^http://(www\\.)?ludios\\.org/", "https://ludios.org/"));
a("www.ludios.org");
a("ludios.org");

R = new RuleSet("Lulu (partial)");
R.rules.push(new Rule("^http://(www\\.)?lulu\\.com/(login|register)\\.php", "https://$1lulu.com/$2.php"));
R.rules.push(new Rule("^http://static\\.lulu\\.com/", "https://static.lulu.com/"));
a("lulu.com");
a("*.lulu.com");

R = new RuleSet("LuxSci");
R.rules.push(new Rule("^http://(?:www\\.)?luxhv\\.com/", "https://luxsci.com/extranet/hvmain.html"));
R.rules.push(new Rule("^http://(securesend\\.|webmail\\.|(?:www\\.)|xpress\\.)?luxsci\\.com/", "https://luxsci.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?luxsci\\.mobi/", "https://luxsci.mobi/"));
a("luxhv.com");
a("www.luxhv.com");
a("luxsci.com");
a("*.luxsci.com");
a("luxsci.mobi");
a("www.luxsci.mobi");

R = new RuleSet("Lyris (partial)");
R.rules.push(new Rule("^http://lyris\\.com/", "https://www.lyris.com/"));
R.rules.push(new Rule("^http://(landing|www)\\.lyris\\.com/", "https://$1.lyris.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?lyrishq\\.com/", "https://www.lyris.com/blog"));
R.rules.push(new Rule("^http://up0\\.net/", "https://www.up0.net/"));
R.rules.push(new Rule("^http://(\\w+)\\.up0\\.net/", "https://$1.up0.net/"));
a("lyris.com");
a("*.lyris.com");
a("lyrishq.com");
a("www.lyrishq.com");
a("up0.net");
a("*.up0.net");

R = new RuleSet("M86security");
R.rules.push(new Rule("^http://(?:www\\.)?m86security\\.com/", "https://www.m86security.com/"));
a("www.m86security.com");
a("m86security.com");

R = new RuleSet("Massachusetts General Hospital OCD & Related Disorders Program");
R.rules.push(new Rule("^http://(www\\.)?mghocd\\.org/", "https://mghocd.org/"));
a("mghocd.org");
a("www.mghocd.org");

R = new RuleSet("MAAWG");
R.rules.push(new Rule("^http://(www\\.)?maawg\\.org/", "https://$1maawg.org/"));
a("maawg.org");
a("www.maawg.org");

R = new RuleSet("MADD California");
R.rules.push(new Rule("^http://(?:www\\.)?maddcalifornia\\.org/", "https://www.maddcalifornia.org/"));
a("maddcalifornia.org");
a("www.maddcalifornia.org");

R = new RuleSet("MAGIX (partial)");
R.rules.push(new Rule("^http://(www\\.)?catooh\\.com/(catoohthumb\\d\\d/|html/|magix/|themes/)", "https://$1catooh.com/$2"));
R.rules.push(new Rule("^http://(www\\.)?magix\\.com/(clear\\.gif|fileadmin/|typo3temp/)", "https://$1magix.com/$2"));
R.rules.push(new Rule("^http://s(hop|upport2)\\.magix\\.com/", "https://s$1.magix.com/"));
R.rules.push(new Rule("^http://(www\\.)?magix\\.info/(\\w\\w)/(courses/|favicon\\.ico|forum|knowledge|local/|media/|mcpool01/|media|member|online-training|pages/|performance-check|[\\w\\-\\.]+\\.\\d+\\.html)", "https://$1magix.info/$2/$3"));
R.rules.push(new Rule("^http://(www\\.)?magix-online\\.com/(theme|upload)s/", "https://$1magix-online.com/$2s/"));
R.rules.push(new Rule("^http://(www\\.)?mufin\\.com/(css/|favicon\\.ico|images/|\\w\\w/(login|register))", "https://$1mufin.com/$2"));
R.rules.push(new Rule("^http://(www\\.)?mygoya\\.de/(favicon\\.ico|themes/|\\w\\w/(anmelden\\.13\\|login\\.18)\\.html)", "https://$1mygoya.de/$2"));
R.rules.push(new Rule("^http://service\\.xara\\.com/", "https://service.xara.com/"));
R.rules.push(new Rule("^http://(?:app|secure)\\.xaraonline\\.com/", "https://secure.xaraonline.com/"));
a("catooh.com");
a("www.catooh.com");
a("magix.com");
a("*.magix.com");
a("magix.info");
a("www.magix.info");
a("magix-online.com");
a("www.magix-online.com");
a("mufin.com");
a("www.mufin.com");
a("mygoya.de");
a("www.mygoya.de");
a("service.xara.com");
a("app.xaraonline.com");
a("secure.xaraonline.com");

R = new RuleSet("MAH.se");
R.rules.push(new Rule("^http://mah\\.se/", "https://www.mah.se/"));
R.rules.push(new Rule("^http://www\\.mah\\.se/", "https://www.mah.se/"));
a("www.mah.se");
a("mah.se");

R = new RuleSet("MAPS");
R.rules.push(new Rule("^http://(www\\.)?maps\\.org/", "https://$1maps.org/"));
R.rules.push(new Rule("^http://store\\.maps\\.org/", "https://store.maps.org/"));
a("maps.org");
a("www.maps.org");

R = new RuleSet("mBank (partial)");
R.rules.push(new Rule("^http://(form\\.)?(cz|sk)\\.mbank\\.eu/", "https://$1$2.mbank.eu/"));
R.rules.push(new Rule("^http://(form|www)\\.mbank\\.com\\.pl/", "https://$1.mbank.com.pl/"));
a("cz.mbank.eu");
a("form.cz.mbank.eu");
a("sk.mbank.eu");
a("form.sk.mbank.eu");
a("form.mbank.com.pl");
a("www.mbank.com.pl");

R = new RuleSet("Maine Civil Liberties Union");
R.rules.push(new Rule("^http://(?:www\\.)?mclu\\.org/", "https://www.mclu.org/"));
a("mclu.org");
a("www.mclu.org");

R = new RuleSet("MDH.se");
R.rules.push(new Rule("^http://mdh\\.se/", "https://www.mdh.se/"));
R.rules.push(new Rule("^http://www\\.mdh\\.se/", "https://www.mdh.se/"));
a("www.mdh.se");
a("mdh.se");

R = new RuleSet("MDNX (partial)");
R.rules.push(new Rule("^http://(\\w+)\\.stcllctrs\\.com/", "https://$1.stcllctrs.com/"));
a("*.stcllctrs.com");

R = new RuleSet("METRO Transit (Harris County, Houston, Texas)");
R.rules.push(new Rule("^((http://((www)\\.)?)|https://)ridemetro\\.org/", "https://www.ridemetro.org/"));
R.rules.push(new Rule("^http://(pass-web|jobs)\\.ridemetro\\.org/", "https://$1.ridemetro.org/"));
a("ridemetro.org");
a("www.ridemetro.org");
a("jobs.ridemetro.org");
a("pass-web.ridemetro.org");

R = new RuleSet("MIN_Commsy");
R.rules.push(new Rule("^http://(?:www\\.)?mincommsy\\.uni-hamburg\\.de/", "https://www.mincommsy.uni-hamburg.de/"));
a("www.mincommsy.uni-hamburg.de");
a("mincommsy.uni-hamburg.de");

R = new RuleSet("Massachusetts Institute of Technology (partial)");
R.rules.push(new Rule("^http://((?:www\\.)?mitpres|(www\\.)?script)s\\.mit\\.edu/", "https://$1s.mit.edu/"));
R.rules.push(new Rule("^http://(www\\.)?mitpressjournals\\.org/((entityImage|na101|sda|templates|userimages)/|action/(registration|showLogin)$)", "https://www.mitpressjournals.org/$2"));
a("*.mit.edu");
a("www.*.mit.edu");
a("mitpressjournals.org");
a("www.mitpressjournals.org");

R = new RuleSet("MIUN.se");
R.rules.push(new Rule("^http://miun\\.se/", "https://www.miun.se/"));
R.rules.push(new Rule("^http://www\\.miun\\.se/", "https://www.miun.se/"));
R.rules.push(new Rule("^http://portal\\.miun\\.se/", "https://portal.miun.se/"));
a("www.miun.se");
a("portal.miun.se");
a("miun.se");

R = new RuleSet("MIX-Computer.de");
R.rules.push(new Rule("^http://(www\\.)?mix-computer\\.de/", "https://www.mix-computer.de/"));
a("www.mix-computer.de");
a("mix-computer.de");

R = new RuleSet("MSN (other domains)");
R.rules.push(new Rule("^http://newsvine\\.com/", "https://www.newsvine.com/"));
R.rules.push(new Rule("^http://((?:www\\.)?bonosrama|(?:www\\.)?lib|log|www)\\.newsvine\\.com/", "https://$1.newsvine.com/"));
R.rules.push(new Rule("^http://i\\.newsvine\\.com/", "https://www.newsvine.com/"));
R.rules.push(new Rule("^http://onesearch4-2\\.newsvine\\.com/_vine/", "https://onesearch4-2.newsvine.com/_vine/"));
R.rules.push(new Rule("^http://(?:www\\.)?polls\\.newsvine\\.com/_(static|vine)/", "https://www.newsvine.com/_$1/"));
R.rules.push(new Rule("^http://kaw\\.(stb|stc)\\.s-msn\\.com/", "https://kaw.$1.s-msn.com/"));
R.exclusions.push(new Exclusion("^http://www\\.newsvine\\.com/_nv/"));
a("newsvine.com");
a("*.newsvine.com");
a("cdn.lib.newsvine.com");
a("polls.newsvine.com");
a("www.*.newsvine.com");
a("kaw.stb.s-msn.com");
a("kaw.stc.s-msn.com");

R = new RuleSet("Music Teachers' Association of California");
R.rules.push(new Rule("^http://(?:www\\.)?mtac\\.org/", "https://www.mtac.org/"));
a("mtac.org");
a("*.mtac.org");

R = new RuleSet("MTNA (partial)");
R.rules.push(new Rule("^http://members\\.mtna\\.org/", "https://members.mtna.org/"));
R.rules.push(new Rule("^http://(www\\.)?mtnafoundation\\.org/", "https://$1mtnafoundation.org/"));
a("members.mtna.org");
a("mtnafoundation.org");
a("www.mtnafoundation.org");

R = new RuleSet("MYEDDEBT.com");
R.rules.push(new Rule("^(http://(www\\.)?|https://)myeddebt\\.com/", "https://www.myeddebt.com/"));
a("myeddebt.com");
a("www.myeddebt.com");

R = new RuleSet("MacWorld");
R.rules.push(new Rule("^http://www\\.macworld\\.com/", "https://www.macworld.com/"));
a("www.macworld.com");

R = new RuleSet("Madison Logic (partial)");
R.rules.push(new Rule("^http://www\\.madisonlogic\\.com/images/(arrow|bg|headBg|linkbutton_background|mainNav)\\.gif$", "https://www.madisonlogic.com/images/$2.gif"));
a("www.madisonlogic.com");

R = new RuleSet("Madstein.at");
R.rules.push(new Rule("^http://(www\\.)?madstein\\.at/", "https://secure.madstein.at/"));
a("www.madstein.at");
a("madstein.at");

R = new RuleSet("Mageia (partial)");
R.rules.push(new Rule("^http://mageia\\.org/", "https://www.mageia.org/"));
R.rules.push(new Rule("^http://(blog|bugs|forums|identity|wiki|www)\\.mageia\\.org/", "https://$1.mageia.org/"));
R.exclusions.push(new Exclusion("^http://planet\\."));
a("mageia.org");
a("*.mageia.org");
a("*.forums.mageia.org");

R = new RuleSet("Magento");
R.rules.push(new Rule("^http://(?:www\\.)?magentocommerce\\.com/", "https://www.magentocommerce.com/"));
a("magentocommerce.com");
a("www.magentocommerce.com");

R = new RuleSet("Magnatune (partial)");
R.rules.push(new Rule("^http://he3\\.magnatune\\.com/", "https://magnatune.com/"));
R.rules.push(new Rule("^http://(www\\.)?magnatune\\.com/", "https://$1magnatune.com/"));
a("magnatune.com");
a("*.magnatune.com");

R = new RuleSet("Magnet.ie");
R.rules.push(new Rule("^http://(?:www\\.)?magnet\\.ie/", "https://www.magnet.ie/"));
a("magnet.ie");
a("www.magnet.ie");

R = new RuleSet("Magneto (partial)");
R.rules.push(new Rule("^http://(www\\.)?imagineecommerce\\.com/wp-content/themes/imagine/favicon\\.ico$", "https://registration.imagineecommerce.com/_assets/img/icons/favicon.ico"));
R.rules.push(new Rule("^http://registration\\.imagineecommerce\\.com/", "https://registration.imagineecommerce.com/"));
R.rules.push(new Rule("^http://go\\.magneto\\.com/(.+[^/]$)", "https://go.magneto.com/$1"));
R.rules.push(new Rule("^http://(www\\.)?magnetocommerce\\.com/", "https://www.magnetocommerce.com/"));
a("imagineecommerce.com");
a("registration.imagineecommerce.com");
a("www.imagineecommerce.com");
a("go.magneto.com");
a("magnetocommerce.com");
a("www.magnetocommerce.com");

R = new RuleSet("Mail.com");
R.rules.push(new Rule("^http://(?:www\\.)?mail\\.com/", "https://www.mail.com/"));
R.rules.push(new Rule("^http://service\\.mail\\.com/", "https://service.mail.com/"));
a("www.mail.com");
a("mail.com");
a("service.mail.com");

R = new RuleSet("Mail.ru (partial)");
R.rules.push(new Rule("^http://(ad|corp|avt\\.foto|img(?:\\.tv)|r3?|sales|showbiz|status|(?:my\\.)?tv)\\.mail\\.ru/", "https://$1.mail.ru/"));
R.rules.push(new Rule("^http://lady\\.mail\\.ru/([^/])\\.css", "https://lady.mail.ru/$1.css"));
R.rules.push(new Rule("^http://news\\.mail\\.ru/(_css/|favicon\\.ico$|img/|pic/|prev\\d{1,6}/)", "https://news.mail.ru/$1"));
R.rules.push(new Rule("^http://m\\.news\\.mail\\.ru/(_css/|favicon\\.ico$|img/)", "https://news.mail.ru/$1"));
R.rules.push(new Rule("^http://r[2s]\\.mail\\.ru/", "https://rs.mail.ru/"));
R.rules.push(new Rule("^http://l?img\\.imgsmail\\.ru/", "https://img.imgsmail.ru/"));
a("ad.mail.ru");
a("corp.mail.ru");
a("avt.foto.mail.ru");
a("img.mail.ru");
a("lady.mail.ru");
a("news.mail.ru");
a("m.news.mail.ru");
a("r.mail.ru");
a("r2.mail.ru");
a("r3.mail.ru");
a("rs.mail.ru");
a("sales.mail.ru");
a("showbiz.mail.ru");
a("status.mail.ru");
a("tv.mail.ru");
a("img.tv.mail.ru");
a("my.tv.mail.ru");
a("img.imgsmail.ru");
a("limg.imgsmail.ru");

R = new RuleSet("MailChimp (partial)");
R.rules.push(new Rule("^http://((\\w+\\.)?admin|blog\\.|login\\.|www\\.)?mailchimp\\.com/", "https://$1mailchimp.com/"));
R.rules.push(new Rule("^http://cdn-images\\.mailchimp\\.com/", "https://s3.amazonaws.com/cdn-images.mailchimp.com/"));
a("mailchimp.com");
a("*.mailchimp.com");
a("*.admin.mailchimp.com");

R = new RuleSet("main-host.de");
R.rules.push(new Rule("^http://(www\\.)?main-host\\.de/", "https://www.main-host.de/"));
R.rules.push(new Rule("^http://kunden\\.main-host\\.de/", "https://kunden.main-host.de/"));
a("main-host.de");
a("kunden.main-host.de");
a("www.main-host.de");

R = new RuleSet("Majestic-12 (partial)");
R.rules.push(new Rule("^http://(www\\.)?majestic12\\.co\\.uk/", "https://$1majestic12.co.uk/"));
R.rules.push(new Rule("^http://majesticseo\\.com/", "https://www.majesticseo.com/"));
R.rules.push(new Rule("^http://www\\.majesticseo\\.com/(account|static)/", "https://www.majesticseo.com/$1/"));
a("majestic12.co.uk");
a("www.majestic12.co.uk");
a("majesticseo.com");
a("www.majesticseo.com");

R = new RuleSet("Major Designs Doll Fashions");
R.rules.push(new Rule("^http://(www\\.)?majordesignsdollfashions\\.com/", "https://$1majordesignsdollfashions.com/"));
a("majordesignsdollfashions.com");
a("www.majordesignsdollfashions.com");

R = new RuleSet("Make-A-Wish Foundation of Michigan");
R.rules.push(new Rule("^http://(?:www\\.)?wishmich\\.org/", "https://www.wishmich.org/"));
a("wishmich.org");
a("www.wishmich.org");

R = new RuleSet("Make My Trip");
R.rules.push(new Rule("^http://makemytrip\\.com/", "https://www.makemytrip.com/"));
R.rules.push(new Rule("^http://(cheapfaresindia|image4|image5|m|railtourism|support|us|www)\\.makemytrip\\.com/", "https://$1.makemytrip.com/"));
a("makemytrip.com");
a("*.makemytrip.com");

R = new RuleSet("Malwarebytes");
R.rules.push(new Rule("^http://(?:\\w+\\.((static-)?cdn\\.)?)?static\\.malwarebytes\\.org/", "https://static.malwarebytes.org/"));
R.rules.push(new Rule("^http://(store\\.|forums\\.)?malwarebytes\\.com/", "https://$1malwarebytes.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?malwarebytes\\."));
a("*.malwarebytes.org");
a("*.static.malwarebytes.org");
a("*.cdn.static.malwarebytes.org");

R = new RuleSet("Mamba");
R.rules.push(new Rule("^http://(?:www\\.)?(corp\\.|img\\.|partner\\.)?mamba\\.ru/", "https://$1mamba.ru/"));
a("mamba.ru");
a("*.mamba.ru");
a("www.corp.mamba.ru");

R = new RuleSet("MarksandSpencer");
R.rules.push(new Rule("^http://(?:www\\.)?marksandspencer\\.com/", "https://www.marksandspencer.com/"));
a("marksandspencer.com");
a("www.marksandspencer.com");

R = new RuleSet("Mandriva.com");
R.rules.push(new Rule("^http://mandriva\\.com/", "https://mandriva.com/"));
R.rules.push(new Rule("^http://www\\.mandriva\\.com/", "https://www.mandriva.com/"));
R.rules.push(new Rule("^http://webapps\\.mandriva\\.com/", "https://webapps.mandriva.com/"));
a("mandriva.com");
a("www.mandriva.com");
a("webapps.mandriva.com");

R = new RuleSet("Manticore (partial)");
R.rules.push(new Rule("^http://(?:app|purl)\\.manticoretechnology\\.com/", "https://app.manticoretechnology.com/"));
a("*.manticoretechnology.com");

R = new RuleSet("MapQuest");
R.rules.push(new Rule("^http://(?:www\\.)?mapquest\\.com/", "https://www.mapquest.com/"));
R.rules.push(new Rule("^http://developer\\.mapquest\\.com/", "https://developer.mapquest.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?mapquestapi\\.com/", "https://www.mapquestapi.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?mapquesthelp\\.com/", "https://www.mapquesthelp.com/"));
a("mapquest.com");
a("www.mapquest.com");
a("mapquestapi.com");
a("www.mapquestapi.com");
a("mapquesthelp.com");
a("www.mapquesthelp.com");

R = new RuleSet("Marie Stopes International Australia");
R.rules.push(new Rule("^http://giveto\\.mariestopes\\.org\\.au/", "https://giveto.mariestopes.org.au/"));
R.rules.push(new Rule("^https?://(www\\.)?mariestopes\\.org\\.au/cms/donate\\.html($|#|\\?)", "https://giveto.mariestopes.org.au/$2"));
R.rules.push(new Rule("^https?://(www\\.)?mariestopes\\.org\\.au/cms/sex-appeal\\.html($|#|\\?)", "https://www.mariestopes.org.au/how-we-help$2"));
R.rules.push(new Rule("^https?://(www\\.)?mariestopes\\.org\\.au/cms/Film-Night-Amelia\\.html($|#|\\?)", "https://www.mariestopes.org.au/how-you-can-help/campaigns-and-appeals/film-nights$2"));
R.rules.push(new Rule("^https?://(www\\.)?mariestopes\\.org\\.au/cms/abortion-aid\\.html($|#|\\?)", "https://www.mariestopes.org.au/news-room/international-programs/media-releases/item/389-abortion-aid-why-is-rudd-the-last-man-standing$2"));
R.rules.push(new Rule("^https?://(www\\.)?mariestopes\\.org\\.au/cms/Country-Programs\\.html($|#|\\?)", "https://www.mariestopes.org.au/how-we-help/where-we-work$2"));
R.rules.push(new Rule("^https?://(www\\.)?mariestopes\\.org\\.au/cms/contact-us\\.html($|#|\\?)", "https://www.mariestopes.org.au/contact-us$2"));
R.rules.push(new Rule("^(http://(www\\.)?|https://)mariestopes\\.org\\.au/", "https://www.mariestopes.org.au/"));
a("mariestopes.org.au");
a("giveto.mariestopes.org.au");
a("www.mariestopes.org.au");

R = new RuleSet("Mark Monitor");
R.rules.push(new Rule("^https?://markmonitor\\.com/", "https://www.markmonitor.com/"));
R.rules.push(new Rule("^http://(corp|www)\\.markmonitor\\.com/", "https://$1.markmonitor.com/"));
a("markmonitor.com");
a("*.markmonitor.com");

R = new RuleSet("MarkRuler (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?conversionruler\\.com/", "https://$1conversionruler.com/"));
a("conversionruler.com");
a("*.conversionruler.com");

R = new RuleSet("Marketo");
R.rules.push(new Rule("^http://(?:www\\.)?marketo\\.(?:com|net)/", "https://www.marketo.com/"));
R.rules.push(new Rule("^http://(app(-a)?|blog|na-i)\\.marketo\\.com/", "https://$1.marketo.com/"));
R.rules.push(new Rule("^http://app\\.marketo\\.net/", "https://app-a.marketo.com/"));
R.rules.push(new Rule("^http://(ssl-)?munchkin\\.marketo\\.(?:com|net)/", "https://$1munchkin.marketo.net/"));
a("marketo.com");
a("www.marketo.com");
a("marketo.net");
a("*.marketo.net");

R = new RuleSet("Secure.marketwatch.com");
R.rules.push(new Rule("^http://secure\\.marketwatch\\.com/", "https://secure.marketwatch.com/"));
R.rules.push(new Rule("^http://www\\.marketwatch\\.com/", "https://secure.marketwatch.com/"));
R.rules.push(new Rule("^http://marketwatch\\.com/", "https://secure.marketwatch.com/"));
a("secure.marketwatch.com");
a("www.marketwatch.com");
a("marketwatch.com");

R = new RuleSet("Marketwire");
R.rules.push(new Rule("^http://(www\\.)?marketwire\\.com/", "https://marketwire.com/"));
R.rules.push(new Rule("^http://media\\.marketwire\\.com/", "https://media.marketwire.com/"));
a("marketwire.com");
a("media.marketwire.com");
a("www.marketwire.com");

R = new RuleSet("Marvell");
R.rules.push(new Rule("^http://(?:(?:origin-)?www\\.)?marvell\\.com/", "https://origin-www.marvell.com/"));
R.rules.push(new Rule("^http://extranet\\.marvell\\.com/", "https://extranet.marvell.com/"));
a("marvell.com");
a("*.marvell.com");

R = new RuleSet("Mashable.com");
R.rules.push(new Rule("^http://(www\\.)?mashable\\.com/", "https://mashable.com/"));
a("mashable.com");
a("www.mashable.com");

R = new RuleSet("Massage Magazine");
R.rules.push(new Rule("^http://(?:www\\.)?massagemag\\.com/", "https://www.massagemag.com/"));
a("massagemag.com");
a("www.massagemag.com");

R = new RuleSet("Materiel.net");
R.rules.push(new Rule("^http://materiel\\.net/", "https://www.materiel.net/"));
R.rules.push(new Rule("^http://([^@/:]*)\\.materiel\\.net/", "https://$1.materiel.net/"));
a("*.materiel.net");
a("materiel.net");

R = new RuleSet("Mathtag.com");
R.rules.push(new Rule("^http://(pixel|action)\\.mathtag\\.com/", "https://$1.mathtag.com/"));
a("pixel.mathtag.com");
a("action.mathtag.com");

R = new RuleSet("MattMccutchen.net");
R.rules.push(new Rule("^http://(www\\.)?mattmccutchen\\.net/", "https://mattmccutchen.net/"));
a("mattmccutchen.net");
a("www.mattmccutchen.net");

R = new RuleSet("Max Hamburgare");
R.rules.push(new Rule("^http://(www\\.)?max\\.se/", "https://www.max.se/"));
a("www.max.se");
a("max.se");

R = new RuleSet("MaxMind");
R.rules.push(new Rule("^http://(?:www\\.)?maxmind\\.com/", "https://www.maxmind.com/"));
a("maxmind.com");
a("www.maxmind.com");

R = new RuleSet("May First/People Link (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?mayfirst\\.com/", "https://mayfirst.com/"));
R.rules.push(new Rule("^http://(id|june|lists|malcom|members|support|webmail)\\.mayfirst\\.org/", "https://$1.mayfirst.org/"));
R.exclusions.push(new Exclusion("^http://didier\\."));
a("mayfirst.org");
a("*.mayfirst.org");

R = new RuleSet("MayFlower Software (partial)");
R.rules.push(new Rule("^http://(www\\.)?maysoft\\.com/", "https://maysoft.com/"));
R.rules.push(new Rule("^http://(www\\.)?notesappstore\\.com/", "https://www.notesappstore.com/"));
a("maysoft.com");
a("www.maysoft.com");
a("notesappstore.com");
a("www.notesappstore.com");

R = new RuleSet("Mayo Clinic (partial)");
R.rules.push(new Rule("^https?://mayoclinic\\.com/", "https://www.mayoclinic.com/"));
R.rules.push(new Rule("^http://(healthletter|store|www)\\.mayoclinic\\.com/", "https://$1.mayoclinic.com/"));
a("mayoclinic.com");
a("*.mayoclinic.com");

R = new RuleSet("McAfee MX Logic");
R.rules.push(new Rule("^http://(?:www\\.)?mxlogic\\.com/", "https://www.mxlogic.com/"));
R.rules.push(new Rule("^http://([^\\.]\\.)?(console|portal)\\.mxlogic\\.com/", "https://$1$2.mxlogic.com/"));
a("mxlogic.com");
a("*.mxlogic.com");

R = new RuleSet("McAfee");
R.rules.push(new Rule("^http://(?:www\\.)?mcafee\\.com/", "https://www.mcafee.com/"));
R.rules.push(new Rule("^http://blogs\\.mcafee\\.com/", "https://blogs.mcafee.com/"));
R.rules.push(new Rule("^http://home\\.mcafee\\.com/", "https://home.mcafee.com/"));
R.rules.push(new Rule("^http://shop\\.mcafee\\.com/", "https://shop.mcafee.com/"));
R.rules.push(new Rule("^http://images\\.mcafee\\.com/", "https://images.mcafee.com/"));
R.rules.push(new Rule("^http://images\\.scanalert\\.com/", "https://images.scanalert.com/"));
R.rules.push(new Rule("^http://secureimages\\.mcafee\\.com/", "https://secureimages.mcafee.com/"));
R.rules.push(new Rule("^http://www\\.mcafeesecure\\.com/", "https://www.mcafeesecure.com/"));
a("mcafee.com");
a("www.mcafee.com");
a("blogs.mcafee.com");
a("home.mcafee.com");
a("images.mcafee.com");
a("images.scanalert.com");
a("mcafeesecure.com");
a("www.mcafeesecure.com");
a("secureimages.mcafee.com");
a("shop.mcafee.com");

R = new RuleSet("McEvoy Group (partial)");
R.rules.push(new Rule("^http://(www\\.)?chroniclebooks\\.com/", "https://$1chroniclebooks.com/"));
a("chroniclebooks.com");
a("*.chroniclebooks.com");

R = new RuleSet("Mederra Group (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?digipaper\\.fi/", "https://www.digipaper.fi/"));
a("digipaper.fi");
a("www.digipaper.fi");

R = new RuleSet("Medgadget (partial)");
R.rules.push(new Rule("^http://cdn\\.medgadget\\.com/", "https://s3.amazonaws.com/medgadgetenglish/"));
a("cdn.medgadget.com");

R = new RuleSet("MediaFire (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?mediafire\\.com/(images/|js/|s(elect_account_type|sl_login)\\.php)", "https://www.mediafire.com/$1"));
R.rules.push(new Rule("^http://(?:orig-)?cdn\\.mediafire\\.com/", "https://origin-cdn.mediafire.com/"));
a("mediafire.com");
a("*.mediafire.com");

R = new RuleSet("MediaLayer.com (partial)");
R.rules.push(new Rule("^http://(clients|support)\\.medialayer\\.com/", "https://$1.medialayer.com/"));
R.rules.push(new Rule("^http://(www\\.)?medialayer\\.net/", "https://www.medialayer.net/"));
a("clients.medialayer.com");
a("support.medialayer.com");
a("medialayer.net");
a("www.medialayer.net");

R = new RuleSet("MediaMatters.org (partial)");
R.rules.push(new Rule("^http://([csw]\\w+\\.)?mediamatters\\.org/static/", "https://s3.amazonaws.com/s3.mediamatters.org/static/"));
a("mediamatters.org");
a("cloudfront.mediamatters.org");
a("s3.mediamatters.org");
a("www.mediamatters.org");

R = new RuleSet("MediaNet (partial)");
R.rules.push(new Rule("^http://(www\\.)?mndigital\\.com/", "https://$1mndigital.com/"));
a("mndigital.com");
a("www.mndigital.com");

R = new RuleSet("MediaNews Group (partial)");
R.rules.push(new Rule("^http://weather\\.mercurynews\\.com/", "https://www.weatherunderground.com/"));
a("weather.mercurynews.com");

R = new RuleSet("Media Temple (partial)");
R.rules.push(new Rule("^http://mediatemple\\.net/", "https://mediatemple.net/"));
R.rules.push(new Rule("^http://(ac|affiliate|api|bin|www)\\.mediatemple\\.net/", "https://$1.mediatemple.net/"));
R.rules.push(new Rule("^http://(?:origin|s[\\d])\\.mt-cdn\\.net/", "https://www.mediatemple.net/"));
a("mediatemple.net");
a("*.mediatemple.net");
a("*.mt-cdn.net");

R = new RuleSet("Mediamarkt.se");
R.rules.push(new Rule("^http://(?:www\\.)?mediamarkt\\.se/", "https://www.mediamarkt.se/"));
a("mediamarkt.se");
a("www.mediamarkt.se");

R = new RuleSet("Median");
R.rules.push(new Rule("^http://audit\\.median\\.hu/", "https://audit.median.hu/"));
a("audit.median.hu");

R = new RuleSet("Mediate.com");
R.rules.push(new Rule("^http://(?:www\\.)?mediate\\.com/", "https://www.mediate.com/"));
a("mediate.com");
a("www.mediate.com");

R = new RuleSet("MedicAlert");
R.rules.push(new Rule("^http://(?:www\\.)?medicalert\\.org/", "https://www.medicalert.org/"));
a("medicalert.org");
a("www.medicalert.org");

R = new RuleSet("Medikamente-Per-Klick");
R.rules.push(new Rule("^http://(?:www\\.|shop\\.)?medikamente-per-klick\\.de/", "https://www.medikamente-per-klick.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?kosmetik-per-klick\\.de/", "https://www.kosmetik-per-klick.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?ernaehrung-per-klick\\.de/", "https://www.ernaehrung-per-klick.de/"));
a("www.medikamente-per-klick.de");
a("medikamente-per-klick.de");
a("shop.medikamente-per-klick.de");
a("www.kosmetik-per-klick.de");
a("kosmetik-per-klick.de");
a("www.ernaehrung-per-klick.de");
a("ernaehrung-per-klick.de");

R = new RuleSet("Medstop.se");
R.rules.push(new Rule("^http://medstop\\.se/", "https://www.medstop.se/"));
R.rules.push(new Rule("^http://www\\.medstop\\.se/", "https://www.medstop.se/"));
a("medstop.se");
a("www.medstop.se");

R = new RuleSet("Meebo");
R.rules.push(new Rule("^http://(?:www\\.)?meebo\\.com/", "https://www.meebo.com/"));
a("www.meebo.com");
a("meebo.com");

R = new RuleSet("Meego");
R.rules.push(new Rule("^http://(?:www\\.)?meego\\.com/", "https://www.meego.com/"));
a("www.meego.com");
a("meego.com");

R = new RuleSet("MegaPath (partial)");
R.rules.push(new Rule("^http://(dashboard|my|support)\\.covad\\.com/", "https://$1.covad.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?megapath\\.com/", "https://www.megapath.com/"));
R.rules.push(new Rule("^http://vp1-voiceportal\\.megapath\\.com/", "https://vp1-voiceportal.megapath.com/Login/"));
R.rules.push(new Rule("^http://connect\\.megapathwholesale\\.com/", "https://connect.megapathwholesale.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?speakeasy\\.net/", "https://speakeasy.net/"));
R.exclusions.push(new Exclusion("^http://support\\.covad\\.com/export/"));
a("dashboard.covad.com");
a("my.covad.com");
a("support.covad.com");
a("megapath.com");
a("vp1-voiceportal.megapath.com");
a("www.megapath.com");
a("connect.megapathwholesale.com");
a("speakeasy.net");
a("*.speakeasy.net");

R = new RuleSet("Mekanist");
R.rules.push(new Rule("^http://(www\\.)?mekanist\\.net/", "https://www.mekanist.net/"));
a("www.mekanist.net");
a("mekanist.net");

R = new RuleSet("Meltwaternews.con");
R.rules.push(new Rule("^http://meltwaternews\\.com/", "https://meltwaternews.com/"));
R.rules.push(new Rule("^http://www\\.meltwaternews\\.com/", "https://www.meltwaternews.com/"));
a("www.meltwaternews.com");
a("meltwaternews.com");

R = new RuleSet("Memset");
R.rules.push(new Rule("^http://(\\w+\\.)?memset\\.com/", "https://$1memset.com/"));
a("memset.com");
a("*.memset.com");

R = new RuleSet("Mendeley");
R.rules.push(new Rule("^http://(?:(?:ha3\\.)?www\\.)?mendeley\\.com/", "https://d1rktifm8krpj.cloudfront.net/"));
R.rules.push(new Rule("^http://dev\\.mendeley\\.com/(applications/register/|forgot|graphics|join|login|styles)/", "https://dev.mendeley.com/$1/"));
R.rules.push(new Rule("^http://support\\.mendeley\\.com/(images/|track\\.gif)", "https://mendeley.uservoice.com/$1"));
a("mendeley.com");
a("*.mendeley.com");
a("ha3.www.mendeley.com");

R = new RuleSet("Mentor Graphics (partial)");
R.rules.push(new Rule("^https?://(?:www\\.)?codesourcery\\.com/", "https://www.mentor.com/embedded-software/codesourcery"));
R.rules.push(new Rule("^http://mentor\\.com/", "https://www.mentor.com/"));
R.rules.push(new Rule("^http://(accounts|store1?|supportnet)\\.mentor\\.com/", "https://$1.mentor.com/"));
R.rules.push(new Rule("^http://cache\\.mentor\\.com/", "https://www.mentor.com/"));
a("codesourcery.com");
a("www.codesourcery.com");
a("mentor.com");
a("*.mentor.com");
a("*.store1.mentor.com");

R = new RuleSet("MetaPress (partial)");
R.rules.push(new Rule("^http://(www\\.)?metapress\\.org/(dynamic-file\\.axd|images/)", "https://www.metapress.org/$2"));
a("metapress.org");
a("www.metapress.org");

R = new RuleSet("Metrix");
R.rules.push(new Rule("^http://(secure\\.|www\\.)?metrix\\.net/", "https://secure.metrix.net/"));
a("metrix.net");
a("secure.metrix.net");
a("www.metrix.net");

R = new RuleSet("Metropolia University of Applied Sciences");
R.rules.push(new Rule("^http://(moodle|metropooli)\\.metropolia\\.fi/", "https://$1.metropolia.fi/"));
a("*.metropolia.fi");

R = new RuleSet("Mibbit");
R.rules.push(new Rule("^http://chat\\.mibbit\\.com/", "https://chat.mibbit.com/"));
R.rules.push(new Rule("^http://data\\.mibbit\\.com/", "https://data.mibbit.com/"));
R.rules.push(new Rule("^http://02\\.chat\\.mibbit\\.com/", "https://02.chat.mibbit.com/"));
R.rules.push(new Rule("^http://widgetmanager\\.mibbit\\.com/", "https://widgetmanager.mibbit.com/"));
a("*.mibbit.com");
a("*.chat.mibbit.com");

R = new RuleSet("Microchip.com");
R.rules.push(new Rule("^http://(?:www\\.)?microchip\\.com/", "https://www.microchip.com/"));
a("www.microchip.com");
a("microchip.com");

R = new RuleSet("Microsoft (partial)");
R.rules.push(new Rule("^http://ajax\\.aspnetcdn\\.com/", "https://ajax.aspnetcdn.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?bing\\.com/(?:fd/|(s/))", "https://ssl.bing.com/fd/$1"));
R.rules.push(new Rule("^http://(c|ssl)\\.bing\\.com/", "https://$1.bing.com/"));
R.rules.push(new Rule("^http://microsoft\\.com/", "https://www.microsoft.com/"));
R.rules.push(new Rule("^http://(adcenter|advertising|ajax|c|connect|social\\.expression|go|ie|msdn|office(365|2010)?|onlinehelp|profile|research|signature|snackbox|(services\\.)?social|store|social\\.technet|www\\.update|windowsupdate|www)\\.microsoft\\.com/", "https://$1.microsoft.com/"));
R.rules.push(new Rule("^https?://(?:i\\d?|js)\\.microsoft\\.com/", "https://www.microsoft.com/"));
R.rules.push(new Rule("^https?://i\\d?\\.((code\\.)?msdn|onlinehelp|(services\\.)?social|(gallery\\.)?technet)\\.(?:microso|s-ms)ft\\.com/", "https://$1.microsoft.com/"));
R.rules.push(new Rule("^http://support\\.microsoft\\.com/((common|library|[sS]tyles)/|LTS/default\\.aspx)", "https://support.microsoft.com/$1"));
R.rules.push(new Rule("^http://(?:origin-)?res[12]?\\.windows\\.microsoft\\.com/", "https://origin-res.windows.microsoft.com/"));
R.rules.push(new Rule("^http://social\\.technet\\.microsoft\\.com/wiki/", "https://social.technet.microsoft.com/"));
R.rules.push(new Rule("^https?://update\\.microsoft\\.com/", "https://www.update.microsoft.com/"));
R.rules.push(new Rule("^http://v(4|5)\\.windowsupdate\\.microsoft\\.com/", "https://v$1.windowsupdate.microsoft.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?microsoftstore\\.com/", "https://www.microsoftstore.com/"));
R.rules.push(new Rule("^http://emea\\.microsoftstore\\.com/(\\w+)/(desktopdefault\\.aspx|portaldata/|services/|tags.axd)", "https://emea.microsoftstore.com/$1/$2"));
R.rules.push(new Rule("^http://assets-(\\d)\\.microsoftstoreassets\\.com/", "https://assets-$1.microsoftstoreassets.com/"));
R.rules.push(new Rule("^http://external\\.microsoftstoreservices\\.com/", "https://external.microsoftstoreservices.com/"));
R.rules.push(new Rule("^http://(?:i1\\.)?(blogs|social)\\.msdn\\.com/", "https://$1.msdn.com/"));
R.rules.push(new Rule("^https?://i\\d\\.social\\.s-msft\\.com/", "https://social.expression.microsoft.com/"));
R.rules.push(new Rule("^https?://(?:i\\d?)?blogs\\.technet\\.com/", "https://blogs.technet.com/"));
R.rules.push(new Rule("^http://ecn\\.dev\\.virtualearth\\.net/", "https://ecn.dev.virtualearth.net/"));
R.rules.push(new Rule("^http://secure\\.wlxrs\\.com/", "https://secure.wlxrs.com/"));
R.exclusions.push(new Exclusion("^http://www\\.microsoft\\.com/(.*FamilyID|security/)"));
R.exclusions.push(new Exclusion("^http://i\\d\\.social\\.s-msft\\.com/wiki/"));
a("ajax.aspnetcdn.com");
a("bing.com");
a("*.bing.com");
a("microsoft.com");
a("*.microsoft.com");
a("social.expression.microsoft.com");
a("*.msdn.microsoft.com");
a("*.code.msdn.microsoft.com");
a("*.onlinehelp.microsoft.com");
a("*.social.microsoft.com");
a("services.social.microsoft.com");
a("*.services.social.microsoft.com");
a("*.technet.microsoft.com");
a("*.gallery.technet.microsoft.com");
a("*.windows.microsoft.com");
a("*.windowsupdate.microsoft.com");
a("www.*.microsoft.com");
a("microsoftstore.com");
a("*.microsoftstore.com");
a("*.microsoftstoreassets.com");
a("external.microsoftstoreservices.com");
a("*.msdn.com");
a("i1.blogs.msdn.com");
a("*.social.s-msft.com");
a("blogs.technet.com");
a("*.blogs.technet.com");
a("ecn.dev.virtualearth.net");
a("secure.wlxrs.com");

R = new RuleSet("Microtech (partial)");
R.rules.push(new Rule("^http://my\\.cloudfloordns\\.com/", "https://www.mtgsy.net/myaccount.php"));
R.rules.push(new Rule("^http://(?:images\\d\\.|www\\.)mtgsy\\.net/", "https://www.mtgsy.net/"));
a("my.cloudfloordns.com");
a("mtgsy.net");
a("*.mtgsy.net");

R = new RuleSet("Mijn ING");
R.rules.push(new Rule("^http://mijn(zakelijk)?\\.ing\\.nl/", "https://mijn$1.ing.nl/"));
a("mijn.ing.nl");
a("mijnzakelijk.ing.nl");

R = new RuleSet("Mikrocontroller.net");
R.rules.push(new Rule("^http://(www\\.)?mikrocontroller\\.net/", "https://www.mikrocontroller.net/"));
a("mikrocontroller.net");
a("www.mikrocontroller.net");

R = new RuleSet("Miles-and-more.com");
R.rules.push(new Rule("^http://(?:www\\.)?miles-and-more\\.com/", "https://www.miles-and-more.com/"));
a("miles-and-more.com");
a("www.miles-and-more.com");

R = new RuleSet("MilkAndMore");
R.rules.push(new Rule("^http://(?:www\\.)?milkandmore\\.co\\.uk/", "https://www.milkandmore.co.uk/"));
a("milkandmore.co.uk");
a("www.milkandmore.co.uk");

R = new RuleSet("lists.mindrot.org");
R.rules.push(new Rule("^http://lists\\.mindrot\\.org/", "https://lists.mindrot.org/"));
a("lists.mindrot.org");

R = new RuleSet("Minecraft");
R.rules.push(new Rule("^http://(?:www\\.)?minecraft\\.net/", "https://www.minecraft.net/"));
a("www.minecraft.net");
a("minecraft.net");

R = new RuleSet("Miniatur Wunderland");
R.rules.push(new Rule("^http://(www\\.)?miniatur-wunderland\\.de/", "https://www.miniatur-wunderland.de/"));
a("www.miniatur-wunderland.de");
a("miniatur-wunderland.de");

R = new RuleSet("Mint");
R.rules.push(new Rule("^http://(?:www\\.)?mint\\.com/", "https://www.mint.com/"));
a("www.mint.com");
a("mint.com");

R = new RuleSet("Minus.com (partial)");
R.rules.push(new Rule("^http://minus\\.com/", "https://minus.com/"));
R.rules.push(new Rule("^http://min\\.us/", "https://minus.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.minus\\.com/", "https://$1.minus.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.min\\.us/", "https://$1.minus.com/"));
R.exclusions.push(new Exclusion("^http://(blog|feedback)\\."));
a("minus.com");
a("*.minus.com");
a("min.us");
a("*.min.us");

R = new RuleSet("MirBSD");
R.rules.push(new Rule("^http://(?:www\\.)?mirbsd\\.org/", "https://www.mirbsd.org/"));
a("mirbsd.org");
a("www.mirbsd.org");

R = new RuleSet("Miranda-IM");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.miranda-im\\.org/", "https://$1.miranda-im.org/"));
a("miranda-im.org");
a("*.miranda-im.org");

R = new RuleSet("Mises.org");
R.rules.push(new Rule("^http://(www\\.)?mises\\.org/", "https://$1mises.org/"));
R.exclusions.push(new Exclusion("^http://mises\\.org/store/"));
a("mises.org");
a("*.mises.org");

R = new RuleSet("Mitsubishi.com");
R.rules.push(new Rule("^http://(?:www\\.)?mitsubishi\\.com/", "https://www.mitsubishi.com/"));
a("www.mitsubishi.com");
a("mitsubishi.com");

R = new RuleSet("Mixpanel (partial)");
R.rules.push(new Rule("^http://(\\w\\.)?mixpanel\\.com/", "https://$1mixpanel.com/"));
R.exclusions.push(new Exclusion("^http://blog\\."));
a("mixpanel.com");
a("*.mixpanel.com");

R = new RuleSet("mixx.com");
R.rules.push(new Rule("^http://mixx\\.com/", "https://mixx.com/"));
R.rules.push(new Rule("^http://www\\.mixx\\.com/", "https://www.mixx.com/"));
a("mixx.com");
a("www.mixx.com");

R = new RuleSet("Mobygames.com");
R.rules.push(new Rule("^http://(www\\.)?mobygames\\.com/", "https://www.mobygames.com/"));
a("www.mobygames.com");
a("mobygames.com");

R = new RuleSet("ModSecurity");
R.rules.push(new Rule("^http://(?:www\\.)?modsecurity\\.org/", "https://modsecurity.org/"));
a("modsecurity.org");
a("www.modsecurity.org");

R = new RuleSet("MokaFive (partial)");
R.rules.push(new Rule("^http://(blog\\.|www\\.)?moka(?:5|five)\\.com/", "https://$1mokafive.com/"));
R.rules.push(new Rule("^https?://(www\\.)?mokafive\\.com/ios$", "http://$1moka5.com/ios"));
R.exclusions.push(new Exclusion("^http://(www\\.)?moka5\\.com/ios$"));
a("moka5.com");
a("*.moka5.com");
a("mokafive.com");
a("*.mokafive.com");

R = new RuleSet("MomentusMedia");
R.rules.push(new Rule("^http://momentusmedia\\.com/", "https://momentusmedia.com/"));
R.rules.push(new Rule("^http://www\\.momentusmedia\\.com/", "https://www.momentusmedia.com/"));
a("momentusmedia.com");
a("www.momentusmedia.com");

R = new RuleSet("Monarch.co.uk");
R.rules.push(new Rule("^http://(?:www\\.)?monarch\\.co\\.uk/", "https://www.monarch.co.uk/"));
a("monarch.co.uk");
a("www.monarch.co.uk");

R = new RuleSet("Moneybookers");
R.rules.push(new Rule("^http://i1\\.mbsvr\\.net/", "https://i1.mbsvr.net/"));
R.rules.push(new Rule("^http://(www\\.)?moneybookers\\.com/", "https://$1moneybookers.com/"));
a("i1.mbsvr.net");
a("moneybookers.com");
a("www.moneybookers.com");

R = new RuleSet("Monotype Imaging (partial)");
R.rules.push(new Rule("^http://(www\\.)?ascenderfonts\\.com/(account/login|af|local)/", "https://www.ascenderfonts.com/$2/"));
R.rules.push(new Rule("^http://(www\\.)?fontmarketplace\\.com/(images/|local/|signin\\.aspx$)", "https://www.fontmarketplace.com/$2"));
R.rules.push(new Rule("^http://(www(-\\d\\d)?\\.)?fonts\\.com/(.+)", "https://www.fonts.com/$2"));
R.rules.push(new Rule("^http://fast\\.fonts\\.com/", "https://fast.fonts.com/"));
R.rules.push(new Rule("^http://(www\\.)?webfonts\\.fonts\\.com/([cC]ontent|min|.+/Subscription)/", "https://webfonts.fonts.com/$1/"));
R.rules.push(new Rule("^http://(www\\.)?fontslive\\.com/(handlers|local)/", "https://www.fontslive.com/$2/"));
R.rules.push(new Rule("^http://webfonts\\.fontslive\\.com/", "https://webfonts.fontslive.com/"));
R.rules.push(new Rule("^http://frs\\.monotypeimaging\\.com/", "https://frs.monotypeimaging.com/"));
a("ascenderfonts.com");
a("www.ascenderfonts.com");
a("fontmarketplace.com");
a("www.fontmarketplace.com");
a("fonts.com");
a("*.fonts.com");
a("webfonts.fonts.com");
a("www.webfonts.fonts.com");
a("fontslive.com");
a("webfonts.fontslive.com");
a("www.fontslive.com");
a("frs.monotypeimaging.com");

R = new RuleSet("Monster (partial)");
R.rules.push(new Rule("^http://(cookie|login)\\.monster\\.com/", "https://$1.monster.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?myresumeagent\\.com/", "https://www.myresumeagent.com/"));
R.rules.push(new Rule("^http://((css|img)-seeker|track)\\.newjobs\\.com/", "https://$1.newjobs.com/"));
R.rules.push(new Rule("^http://(?:secure)?media\\.(?:monster|newjobs)\\.com/", "https://securemedia.newjobs.com/"));
a("myresumeagent.com");
a("www.myresumeagent.com");
a("cookie.monster.com");
a("login.monster.com");
a("media.monster.com");
a("css-seeker.newjobs.com");
a("img-seeker.newjobs.com");
a("media.newjobs.com");
a("securemedia.newjobs.com");
a("track.newjobs.com");

R = new RuleSet("Mookie1.com");
R.rules.push(new Rule("^http://(t|b3-uk|b3|dna1)\\.mookie1\\.com/", "https://$1.mookie1.com/"));
a("t.mookie1.com");
a("b3-uk.mookie1.com");
a("b3.mookie1.com");
a("dna1.mookie1.com");

R = new RuleSet("MoonPig");
R.rules.push(new Rule("^http://(?:www\\.)?moonpig\\.com/", "https://moonpig.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?moonpig\\.com\\.au/", "https://www.moonpig.com.au/"));
a("moonpig.com");
a("www.moonpig.com");
a("moonpig.com.au");
a("www.moonpig.com.au");

R = new RuleSet("Moroccan Bazaar");
R.rules.push(new Rule("^http://(www\\.)?moroccanbazaar\\.co\\.uk/", "https://$1moroccanbazaar.co.uk/"));
a("moroccanbazaar.co.uk");
a("*.moroccanbazaar.co.uk");

R = new RuleSet("Morrisons");
R.rules.push(new Rule("^http://(www\\.)?morrisons\\.co\\.uk/", "https://www.morrisons.co.uk/"));
a("morrisons.co.uk");
a("www.morrisons.co.uk");

R = new RuleSet("Motesplatsen.se");
R.rules.push(new Rule("^http://www\\.motesplatsen\\.se/", "https://www.motesplatsen.se/"));
a("www.motesplatsen.se");

R = new RuleSet("MotherJones.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?motherjones\\.com/(files|misc|themes)/", "https://motherjones.com/sites/all/$2/"));
a("motherjones.com");
a("www.motherjones.com");

R = new RuleSet("Motherless (partial)");
R.rules.push(new Rule("^http://(www\\.)?motherless\\.com/(images/|login|scripts/|styles/)", "https://motherless.com/$2"));
a("motherless.com");
a("www.motherless.com");

R = new RuleSet("The Motley Fool (partial)");
R.rules.push(new Rule("^http://fool\\.com/", "https://www.fool.com/"));
R.rules.push(new Rule("^http://www\\.fool\\.co(m|m\\.au|\\.uk)/(ads/|author/|Foolwatch/|help/|img/|Landing/|marketing/|PopUps/|press/|Scripts/|secure/|shop/|tracking/)", "https://www.fool.co$1/$2"));
R.rules.push(new Rule("^http://boards\\.fool\\.com/(Css/|\\w+\\.aspx$)", "https://boards.fool.com/$1"));
R.rules.push(new Rule("^http://caps\\.fool\\.com/(Blogs|Ticker/)", "https://caps.fool.com/$1"));
R.rules.push(new Rule("^http://my\\.fool\\.com/", "https://my.fool.com/"));
R.rules.push(new Rule("^http://[gs]\\.fool(?:cdn)?\\.co(m|m\\.au|\\.uk)/", "https://s.foolcdn.co$1/"));
R.rules.push(new Rule("^http://wiki\\.fool\\.com/", "https://wiki.fool.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?marketfoolery\\.com/", "https://wiki.fool.com/MarketFoolery"));
a("fool.com");
a("*.fool.com");
a("fool.com.au");
a("*.fool.com.au");
a("fool.co.uk");
a("*.fool.co.uk");
a("*.foolcdn.com");
a("marketfoolery.com");
a("www.marketfoolery.com");

R = new RuleSet("MoveOn");
R.rules.push(new Rule("^https?://(?:www\\.)?moveon\\.org/([a-z0-9]+)$", "https://www.moveon.org/$1/"));
R.rules.push(new Rule("^https?://(pol|civic|civ)\\.moveon\\.org/([a-z0-9]+)$", "https://$1.moveon.org/$2/"));
R.rules.push(new Rule("^https?://civic\\.moveon\\.org/([a-z0-9]+){1}/{2,}", "https://civic.moveon.org/$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?moveon\\.org/r\\?", "https://www.moveon.org/r/?"));
R.rules.push(new Rule("^http://(?:www\\.)?moveon\\.org/(([^a-z0-9]+)|([a-z0-9]{2,}\\?)|([a-qs-z0-9]\\?)|([a-z0-9]+[^a-z0-9?]+)){1}", "https://www.moveon.org/$1"));
R.rules.push(new Rule("^http://(pol|civ)\\.moveon\\.org/([^a-z0-9]+|([a-z0-9]+[^a-z0-9]+)|$){1}", "https://$1.moveon.org/$2"));
R.rules.push(new Rule("^http://civic\\.moveon\\.org/(([^a-z0-9]+)|([a-z0-9]+[^a-z0-9/]+)|([a-z0-9]+/($|[^/]+))|$){1}", "https://civic.moveon.org/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?moveonpac\\.org/", "https://www.moveonpac.org/"));
a("moveon.org");
a("*.moveon.org");
a("moveonpac.org");
a("www.moveonpac.org");

R = new RuleSet("Movelia");
R.rules.push(new Rule("^http://(?:www\\.)?movelia\\.es/", "https://www.movelia.es/"));
a("movelia.es");
a("www.movelia.es");

R = new RuleSet("Mozdev (partial)");
R.rules.push(new Rule("^http://(hg\\.|svn\\.|www\\.)?mozdev\\.org/", "https://$1mozdev.org/"));
R.rules.push(new Rule("^http://bugzilla\\.mozdev\\.org/", "https://www.mozdev.org/bugs/"));
a("mozdev.org");
a("bugzilla.mozdev.org");
a("hg.mozdev.org");
a("svn.mozdev.org");
a("www.mozdev.org");

R = new RuleSet("Mozilla");
R.rules.push(new Rule("^http://mozilla\\.org/", "https://www.mozilla.org/"));
R.rules.push(new Rule("^http://(addons|blog|bzr|communitystore|creative|developer|directory|donate|education|etherpad|firefoxlive|ftp|intlstore|krakenbenchmark|lists|l10n|localize|hacks|hg|labs|mail|mpl|mxr|nightly|studentreps|support|tbp1|quality|wiki|www)\\.mozilla\\.org/", "https://$1.mozilla.org/"));
R.rules.push(new Rule("^http://mozilla\\.com/", "https://www.mozilla.com/"));
R.rules.push(new Rule("^http://(blog|crash-stats|input|people|support|www)\\.mozilla\\.com/", "https://$1.mozilla.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?mozillalabs\\.com/", "https://mozillalabs.com/"));
R.rules.push(new Rule("^http://(apps|bespin|bespinplugins|gaming|heatmap|jetpack|testpilot)\\.mozillalabs\\.com/", "https://$1.mozillalabs.com/"));
R.rules.push(new Rule("^http://mozillamessaging\\.com/", "https://mozillamessaging.com/"));
R.rules.push(new Rule("^http://(planet|www|support)\\.mozillamessaging\\.com/", "https://$1.mozillamessaging.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?drumbeat\\.org/", "https://www.drumbeat.org/"));
R.exclusions.push(new Exclusion("^http://nightly\\.mozilla\\.org/"));
a("mozilla.org");
a("*.mozilla.org");
a("mozilla.com");
a("*.mozilla.com");
a("mozillalabs.com");
a("*.mozillalabs.com");
a("mozillamessaging.com");
a("www.mozillamessaging.com");
a("planet.mozillamessaging.com");
a("support.mozillamessaging.com");
a("drumbeat.org");
a("www.drumbeat.org");

R = new RuleSet("Mozy");
R.rules.push(new Rule("^http://(?:www\\.)?mozy\\.com/", "https://mozy.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?mozy\\.co\\.uk/", "https://mozy.co.uk/"));
a("mozy.com");
a("mozy.co.uk");
a("www.mozy.com");
a("www.mozy.co.uk");

R = new RuleSet("Mpx");
R.rules.push(new Rule("^http://(?:www\\.)?mpx\\.no/", "https://www.mpx.no/"));
a("mpx.no");
a("www.mpx.no");

R = new RuleSet("Mt.Gox");
R.rules.push(new Rule("^http://(?:www\\.)?mtgox\\.com/", "https://www.mtgox.com/"));
a("mtgox.com");
a("www.mtgox.com");

R = new RuleSet("Mullet.se");
R.rules.push(new Rule("^http://www\\.mullet\\.se/", "https://www.mullet.se/"));
R.rules.push(new Rule("^http://mullet\\.se/", "https://mullet.se/"));
a("mullet.se");
a("www.mullet.se");

R = new RuleSet("Mullvad.net");
R.rules.push(new Rule("^http://mullvad\\.net/", "https://mullvad.net/"));
R.rules.push(new Rule("^http://www\\.mullvad\\.net/", "https://www.mullvad.net/"));
a("mullvad.net");
a("www.mullvad.net");

R = new RuleSet("Musikerforbundet.se");
R.rules.push(new Rule("^http://musikerforbundet\\.se/", "https://www.musikerforbundet.se/"));
R.rules.push(new Rule("^http://www\\.musikerforbundet\\.se/", "https://www.musikerforbundet.se/"));
a("musikerforbundet.se");
a("www.musikerforbundet.se");

R = new RuleSet("My-files.de");
R.rules.push(new Rule("^http://w01\\.my-files\\.de/", "https://w01.my-files.de/"));
a("w01.my-files.de");

R = new RuleSet("MyBuys (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?mybuys\\.com/favicon\\.ico", "https://portal.p.mybuys.com/portal/VAADIN/themes/mybuys/favicon.ico"));
R.rules.push(new Rule("^http://(?:www\\.)?mybuys\\.com/portal", "https://portal.p.mybuys.com/"));
R.rules.push(new Rule("^http://(bi5|portal|t)\\.p\\.mybuys\\.com/", "https://$1.p.mybuys.com/"));
a("mybuys.com");
a("*.p.mybuys.com");
a("www.mybuys.com");

R = new RuleSet("MyCharity.ie");
R.rules.push(new Rule("^http://(?:www\\.)?mycharity\\.ie/", "https://www.mycharity.ie/"));
a("mycharity.ie");
a("www.mycharity.ie");

R = new RuleSet("MyChart");
R.rules.push(new Rule("^(http://(www\\.)?|https://)viewmychart\\.com/", "https://www.viewmychart.com/"));
a("viewmychart.com");
a("www.viewmychart.com");

R = new RuleSet("MyEdAccount.Com");
R.rules.push(new Rule("^(http://(www\\.)?|https://)myedaccount\\.com/", "https://www.myedaccount.com/"));
a("myedaccount.com");
a("www.myedaccount.com");

R = new RuleSet("MyFonts.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?myfonts\\.com/(s|secure)/", "https://www.myfonts.com/$2/"));
R.rules.push(new Rule("^http://([m-vy]\\w+)\\.myfonts\\.(com|net)/", "https://$1.myfonts.net/"));
R.rules.push(new Rule("^http://cdn\\.myfonts\\.(com|net)/", "https://origin.myfonts.net/"));
a("myfonts.com");
a("cdn.myfonts.com");
a("my.myfonts.com");
a("origin.myfonts.com");
a("www.myfonts.com");
a("your.myfonts.com");
a("cdn.myfonts.net");
a("my.myfonts.net");
a("origin.myfonts.net");
a("your.myfonts.net");

R = new RuleSet("MyGNU.de");
R.rules.push(new Rule("^http://(www\\.)?mygnu\\.de/", "https://www.mygnu.de/"));
a("mygnu.de");
a("www.mygnu.de");

R = new RuleSet("MyOpenID");
R.rules.push(new Rule("^http://(www\\.)?myopenid\\.com/", "https://myopenid.com/"));
R.exclusions.push(new Exclusion("http://www\\.myopenid\\.com/server"));
a("www.myopenid.com");
a("myopenid.com");

R = new RuleSet("MyPlayDirect");
R.rules.push(new Rule("^http://(?:www\\.)?myplaydirect\\.com/", "https://www.myplaydirect.com/"));
a("myplaydirect.com");
a("www.myplaydirect.com");

R = new RuleSet("MyPoints");
R.rules.push(new Rule("^http://(?:www\\.)?mypoints\\.com/", "https://www.mypoints.com/"));
a("mypoints.com");
a("www.mypoints.com");

R = new RuleSet("MySQL");
R.rules.push(new Rule("^http://([^/:@\\.]+\\.)?mysql\\.com/", "https://$1mysql.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?mysql\\.(\\w\\w)/", "https://www.mysql.$1/"));
R.exclusions.push(new Exclusion("^http://(bugs|forge|lists|planet|wb)\\.mysql\\.com/"));
a("mysql.com");
a("*.mysql.com");
a("mysql.de");
a("www.mysql.de");
a("mysql.fr");
a("www.mysql.fr");
a("mysql.it");
a("www.mysql.it");

R = new RuleSet("MyTUM.de");
R.rules.push(new Rule("^http://portal\\.mytum\\.de/", "https://portal.mytum.de/"));
a("portal.mytum.de");

R = new RuleSet("MyUHC");
R.rules.push(new Rule("^http://(?:www\\.)?myuhc\\.com/", "https://www.myuhc.com/"));
a("myuhc.com");
a("www.myuhc.com");

R = new RuleSet("MyWOT");
R.rules.push(new Rule("^http://(?:www\\.)?mywot\\.com/", "https://www.mywot.com/"));
a("mywot.com");
a("www.mywot.com");

R = new RuleSet("Mydigipass.com");
R.rules.push(new Rule("^http://([a-z]+\\.)?mydigipass\\.com/", "https://$1mydigipass.com/"));
R.rules.push(new Rule("^http://www\\.sandbox\\.mydigipass\\.com/", "https://www.sandbox.mydigipass.com/"));
a("mydigipass.com");
a("www.mydigipass.com");
a("developer.mydigipass.com");
a("www.developer.mydigipass.com");
a("sandbox.mydigipass.com");
a("www.sandbox.mydigipass.com");

R = new RuleSet("Mydrive");
R.rules.push(new Rule("^http://(www|static|webdav)\\.?mydrive\\.ch/", "https://$1.mydrive.ch/"));
a("mydrive.ch");
a("www.mydrive.ch");
a("static.mydrive.ch");
a("webdav.mydrive.ch");

R = new RuleSet("Myspace");
R.rules.push(new Rule("^http://(?:www\\.)?myspace\\.com/", "https://www.myspace.com/"));
a("www.myspace.com");
a("myspace.com");

R = new RuleSet("NAB");
R.rules.push(new Rule("^http://nab\\.com\\.au/", "https://www.nab.com.au/"));
R.rules.push(new Rule("^http://(equitylending|mobile|transact|www)\\.nab\\.com\\.au/", "https://$1.nab.com.au/"));
a("nab.com.au");
a("*.nab.com.au");

R = new RuleSet("NASDAQ (partial)");
R.rules.push(new Rule("^http://secure\\.directorsdesk\\.com/", "https://secure.directorsdesk.com/"));
R.rules.push(new Rule("^http://community\\.nasdaq\\.com/", "https://community.nasdaq.com/"));
R.rules.push(new Rule("^http://(corporateintelligence|listingcenter)\\.nasdaqomx\\.com/", "https://$1.nasdaqomx.com/"));
R.rules.push(new Rule("^http://dialogue\\.openboard\\.info/", "https://dialogue.openboard.info/"));
R.rules.push(new Rule("^http://(www\\.)?(dialogue\\.|investor\\.)?shareholder\\.com/", "https://$2shareholder.com/"));
a("secure.directorsdesk.com");
a("community.nasdaq.com");
a("*.nasdaqomx.com");
a("dialogue.openboard.info");
a("shareholder.com");
a("investor.shareholder.com");
a("dialogue.shareholder.com");
a("www.shareholder.com");

R = new RuleSet("NHS (partial)");
R.rules.push(new Rule("^http://(www2?\\.)?healthunlocked\\.com/", "https://$1healthunlocked.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.healthunlocked\\.com/(assets/|images/)", "https://$1.healthunlocked.com/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?nhs\\.uk/(_layouts/\\d\\d\\d\\d/styles/Menu\\.css|conditions/|css/(base|find-services|personalisation|print|reset|screen)\\.css|img/(buttons/btn-arrow\\.gif|header/|(chevron-grey|directgov|information-standards|sprite-footer)\\.gif|sub-nav-b(g|order))|News/|Personalisation/)", "https://www.nhs.uk/$1"));
R.rules.push(new Rule("^http://(www\\.)?talkhealthpartnership\\.com/", "https://$1talkhealthpartnership.com/"));
a("healthunlocked.com");
a("*.healthunlocked.com");
a("nhs.uk");
a("www.nhs.uk");
a("talkhealthpartnership.com");
a("*.talkhealthpartnership.com");

R = new RuleSet("NL Politiek");
R.rules.push(new Rule("^http://(?:www\\.)?(cda|d66|sp)\\.nl/", "https://www.$1.nl/"));
R.rules.push(new Rule("^http://(?:www\\.)?(groenlinks)\\.nl/", "https://$1.nl/"));
a("cda.nl");
a("www.cda.nl");
a("d66.nl");
a("www.d66.nl");
a("groenlinks.nl");
a("www.groenlinks.nl");
a("sp.nl");
a("www.sp.nl");

R = new RuleSet("National Lawyers Guild");
R.rules.push(new Rule("^http://(?:www\\.)?nlg\\.org/", "https://www.nlg.org/"));
a("nlg.org");
a("www.nlg.org");

R = new RuleSet("NLnet Labs");
R.rules.push(new Rule("^http://(www\\.)?net-dns\\.org/", "https://$1net-dns.org/"));
R.rules.push(new Rule("^http://(open\\.|www\\.)?nlnetlabs\\.nl/", "https://$1nlnetlabs.nl/"));
R.rules.push(new Rule("^http://opendnssec\\.org/", "https://www.opendnssec.org/"));
R.rules.push(new Rule("^http://w(iki|ww)\\.opendnssec\\.org/", "https://w$1.opendnssec.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?unbound\\.net/", "https://unbound.net/"));
a("net-dns.org");
a("www.net-dns.org");
a("nlnetlabs.nl");
a("*.nlnetlabs.nl");
a("opendnssec.org");
a("*.opendnssec.org");
a("unbound.net");
a("www.unbound.net");

R = new RuleSet("NPR.org");
R.rules.push(new Rule("^http://help\\.npr\\.org/$", "https://www.fuzeqna.com/npr/consumer/search.asp"));
R.rules.push(new Rule("^http://help\\.npr\\.org/npr/", "https://www.fuzeqna.com/npr/"));
R.rules.push(new Rule("^http://(?:media\\.|www\\.)?npr\\.org/", "https://www.npr.org/"));
R.rules.push(new Rule("^http://shop\\.npr\\.org/", "https://shop.npr.org/"));
a("npr.org");
a("*.npr.org");

R = new RuleSet("NSRC");
R.rules.push(new Rule("^http://(www\\.)?nsrc\\.org/", "https://nsrc.org/"));
a("nsrc.org");
a("www.nsrc.org");

R = new RuleSet("Nttdocomo.com");
R.rules.push(new Rule("^http://www\\.nttdocomo\\.com/", "https://www.nttdocomo.com/"));
R.rules.push(new Rule("^http://nttdocomo\\.com/", "https://www.nttdocomo.com/"));
a("www.nttdocomo.com");
a("nttdocomo.com");

R = new RuleSet("NTU");
R.rules.push(new Rule("^http://(?:www\\.)?ntu\\.ac\\.uk/", "https://www.ntu.ac.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?ntualumni\\.org\\.uk/", "https://www.ntualumni.org.uk/"));
a("ntu.ac.uk");
a("www.ntu.ac.uk");
a("ntualumni.org.uk");
a("www.ntualumni.org.uk");

R = new RuleSet("NTVB Media (partial)");
R.rules.push(new Rule("^http://(secure\\.|www\\.)?iwantmytvmagazine\\.com/", "https://$1iwantmytvmagazine.com/"));
a("iwantmytvmagazine.com");
a("*.iwantmytvmagazine.com");

R = new RuleSet("NTVSpor");
R.rules.push(new Rule("^http://(www\\.)?ntvspor\\.net/", "https://www.ntvspor.net/"));
a("www.ntvspor.net");
a("ntvspor.net");

R = new RuleSet("NYDailyNews");
R.rules.push(new Rule("^http://(?:www\\.)?nydailynews\\.com/", "https://www.nydailynews.com/"));
R.rules.push(new Rule("^http://(classifiedads)\\.nydailynews\\.com/", "https://$1.nydailynews.com/"));
a("nydailynews.com");
a("www.nydailynews.com");
a("classifiedads.dailynews.com");

R = new RuleSet("New York Stock Exchange (partial)");
R.rules.push(new Rule("^http://exchanges\\.nyx\\.com/", "https://exchanges.nyx.com/"));
a("exchanges.nyx.com");

R = new RuleSet("NYTimes (partial)");
R.rules.push(new Rule("^http://(graphics\\.|www\\.)?boston\\.com/", "https://$1boston.com/"));
R.rules.push(new Rule("^http://cache\\.boston\\.com/", "https://graphics.boston.com/"));
R.rules.push(new Rule("^http://deals\\.boston\\.com/(favicon\\.ico|signup|views/)", "https://deals.boston.com/$1"));
R.rules.push(new Rule("^http://weather\\.boston\\.com/", "https://www.boston.com/weather/"));
R.rules.push(new Rule("^http://(services\\.)?bostonglobe\\.com/", "https://$1bostonglobe.com/"));
R.rules.push(new Rule("^http://www\\.bostonglobe\\.com/", "https://bostonglobe.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?newyorktimes\\.com/", "https://www.nytimes.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?nyt(?:imes)?\\.com/", "https://www.nytimes.com/"));
R.rules.push(new Rule("^http://(?:css|i1)\\.nyt\\.com/", "https://www.nytimes.com/"));
R.rules.push(new Rule("^http://\\w+\\.blogs\\.nytimes\\.com/favicon\\.ico", "https://www.nytimes.com/favicon.ico"));
R.rules.push(new Rule("^http://(global|myaccount|markets\\.on|up)\\.nytimes\\.com/", "https://$1.nytimes.com/"));
R.rules.push(new Rule("^http://graphics\\d\\.nytimes\\.com/", "https://www.nytimes.com/"));
R.rules.push(new Rule("^http://jobmarket\\.nytimes\\.com/(adx|images)/", "https://www.nytimes.com/$1/"));
R.rules.push(new Rule("^http://travel\\.nytimes\\.com/(\\d{4}/\\d\\d/\\d\\d|adx|js)/", "https://www.nytimes.com/$1/"));
R.exclusions.push(new Exclusion("http://(epaper|spiderbites)\\.bostonglobe\\.com/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?nytimes\\.com/roomfordebate"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?nytimes\\.com/(1[89]\\d\\d|200[0-4])/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?nytimes\\.com/info/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?nytimes\\.com/services/xml/rss/index.html"));
a("boston.com");
a("*.boston.com");
a("bostonglobe.com");
a("*.bostonglobe.com");
a("newyorktimes.com");
a("www.newyorktimes.com");
a("nyt.com");
a("*.nyt.com");
a("nytimes.com");
a("*.blogs.nytimes.com");
a("markets.on.nytimes.com");
a("*.nytimes.com");

R = new RuleSet("NZBIndex");
R.rules.push(new Rule("^http://(?:www\\.)?nzbindex\\.(?:nl|com)/", "https://nzbindex.com/"));
a("nzbindex.nl");
a("www.nzbindex.nl");
a("nzbindex.com");
a("www.nzbindex.com");

R = new RuleSet("nzbmatrix");
R.rules.push(new Rule("^http://(www\\.)?nzbmatrix\\.com/", "https://nzbmatrix.com/"));
R.rules.push(new Rule("^http://(search|static)\\.nzbmatrix\\.com/", "https://$1.nzbmatrix.com/"));
a("*.nzbmatrix.com");
a("nzbmatrix.com");

R = new RuleSet("Name.com (partial)");
R.rules.push(new Rule("^http://manage\\.name\\.com/", "https://manage.name.com/"));
a("manage.name.com");

R = new RuleSet("NameCheap");
R.rules.push(new Rule("^http://(?:www\\.)?namecheap\\.com/", "https://www.namecheap.com/"));
R.rules.push(new Rule("^http://files\\.namecheap\\.com/", "https://files.namecheap.com/"));
a("namecheap.com");
a("www.namecheap.com");
a("files.namecheap.com");

R = new RuleSet("NameMedia (partial)");
R.rules.push(new Rule("^http://(?:origin-)?images\\.sitesense-oo\\.com/", "https://origin-images.sitesense-oo.com/"));
R.rules.push(new Rule("^http://partners\\.smartname\\.com/", "https://partners.smartname.com/"));
a("partners.smartname.com");
a("*.sitesense-oo.com");

R = new RuleSet("Names");
R.rules.push(new Rule("^http://(?:www\\.)?names\\.co\\.uk/", "https://www.names.co.uk/"));
R.rules.push(new Rule("^http://(admin|webmail4?)\\.names\\.co\\.uk/", "https://$1.names.co.uk/"));
a("names.co.uk");
a("www.names.co.uk");
a("admin.names.co.uk");
a("webmail4.names.co.uk");

R = new RuleSet("Nanigans (partial)");
R.rules.push(new Rule("^http://api\\.nanigans\\.com/", "https://api.nanigans.com/"));
a("api.nanigans.com");

R = new RuleSet("NanoHUB");
R.rules.push(new Rule("^http://(?:www\\.)?nanohub\\.org/", "https://nanohub.org/"));
a("nanohub.org");
a("www.nanohub.org");

R = new RuleSet("Nasuni.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?nasuni\\.com/(account|evaluate|fonts/|img/|writable/)", "https://www.nasuni.com/$2"));
R.rules.push(new Rule("^http://account\\.nasuni\\.com/", "https://account.nasuni.com/"));
a("nasuni.com");
a("account.nasuni.com");
a("www.nasuni.com");

R = new RuleSet("The National Academies (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?nae\\.edu/", "https://www.nae.edu/"));
R.rules.push(new Rule("^http://www8\\.nationalacademies\\.org/", "https://www8.nationalacademies.org/"));
a("nae.edu");
a("www.nae.edu");
a("www8.nationalacademies.org");

R = new RuleSet("National Defense Industrial Association (partial)");
R.rules.push(new Rule("^http://(www\\.)?n(ationaldefensemagazine|dia)\\.org/(_layouts/|banman/|Divisions/|favicon\\.ico|flash/|images/|(Publishing|SiteCollection)Images/|Style%20Library/|WebResource\\.axd)", "https://$1n$2.org/$3"));
a("nationaldefensemagazine.org");
a("www.nationaldefensemagazine.org");
a("ndia.org");
a("www.ndia.org");

R = new RuleSet("National Press Photographers Association");
R.rules.push(new Rule("^((http://(?:www\\.)?)|https://)nppa\\.org/", "https://www.nppa.org/"));
a("nppa.org");
a("www.nppa.org");

R = new RuleSet("National Rail Enquiries (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?nationalrail\\.co\\.uk/images/", "https://ojp.nationalrail.co.uk/redesign/default/images/"));
R.rules.push(new Rule("^http://img\\.nationalrail\\.co\\.uk/", "https://ojp.nationalrail.co.uk/redesign/default/images/"));
R.rules.push(new Rule("^http://ojp\\.nationalrail\\.co\\.uk/", "https://ojp.nationalrail.co.uk/"));
a("nationalrail.co.uk");
a("*.nationalrail.co.uk");

R = new RuleSet("National Renewable Energy Laboratory (partial)");
R.rules.push(new Rule("^http://(www\\.)?nrel\\.gov/((news/features/|sustainable_nrel/)?images(?:1)?|(data/pix/)?includes|includes_tableless)/", "https://$1.nrel.gov/$1/"));
R.rules.push(new Rule("^http://rredc\\.nrel\\.gov/gifs/", "https://rredc.nrel.gov/gifs/"));
a("nrel.gov");
a("rredc.nrel.gov");
a("www.nrel.gov");

R = new RuleSet("National Research Council Canada");
R.rules.push(new Rule("^http://(www\\.)?nrc-cnrc\\.gc\\.ca/", "https://$1nrc-cnrc.gc.ca/"));
a("nrc-cnrc.gc.ca");
a("www.nrc-cnrc.gc.ca");

R = new RuleSet("National Retail Federation (partial)");
R.rules.push(new Rule("^http://(www\\.)?nrf\\.com/", "https://$1nrf.com/"));
a("nrf.com");
a("www.nrf.com");

R = new RuleSet("National University of Ireland (partial)");
R.rules.push(new Rule("^http://(www\\.)?deri\\.ie/", "https://$1deri.ie/"));
R.rules.push(new Rule("^http://(?:www\\.)?nuigalway\\.ie/", "https://www.nuigalway.ie/"));
a("deri.ie");
a("www.deri.ie");
a("nuigalway.ie");
a("www.nuigalway.ie");

R = new RuleSet("NationalArchivesGovUK");
R.rules.push(new Rule("^http://(?:www\\.)?nationalarchives\\.gov\\.uk/", "https://www.nationalarchives.gov.uk/"));
a("nationalarchives.gov.uk");
a("www.nationalarchives.gov.uk");

R = new RuleSet("NationalLottery");
R.rules.push(new Rule("^http://(?:www\\.)?national-lottery\\.co\\.uk/", "https://www.national-lottery.co.uk/"));
a("national-lottery.co.uk");
a("www.national-lottery.co.uk");

R = new RuleSet("NationalReview.com (partial)");
R.rules.push(new Rule("^http://(nr-media-01|www2)\\.nationalreview\\.com/", "https://$1.nationalreview.com/"));
R.rules.push(new Rule("^http://(www\\.)?nationalreview\\.com/(images|sites)/", "https://www.nationalreview.com/$2/"));
a("nationalreview.com");
a("nr-media-01.nationalreview.com");
a("www.nationalreview.com");
a("www2.nationalreview.com");

R = new RuleSet("National American Arab Nursing Association");
R.rules.push(new Rule("^(http://(www\\.)?|https://www\\.)n-aana\\.org/", "https://n-aana.org/"));
a("n-aana.org");
a("www.n-aana.org");

R = new RuleSet("National Children's Leukemia Foundation");
R.rules.push(new Rule("^http://(www\\.)?leukemiafoundation\\.org/", "https://www.leukemiafoundation.org/"));
R.rules.push(new Rule("^https://leukemiafoundation\\.org/", "https://www.leukemiafoundation.org/"));
a("leukemiafoundation.org");
a("www.leukemiafoundation.org");

R = new RuleSet("National Eating Disorders Association");
R.rules.push(new Rule("^(http://(www\\.)?|https://)nationaleatingdisorders\\.org/", "https://www.nationaleatingdisorders.org/"));
R.exclusions.push(new Exclusion("^http://(www.)?nationaleatingdisorders\\.org/photo-gallery/"));
R.exclusions.push(new Exclusion("^http://(www.)?nationaleatingdisorders\\.org/cmtadmin/"));
a("nationaleatingdisorders.org");
a("www.nationaleatingdisorders.org");

R = new RuleSet("National Suicide Prevention Lifeline");
R.rules.push(new Rule("^http://(?:www\\.)?suicidepreventionlifeline\\.org/", "https://www.suicidepreventionlifeline.org/"));
a("suicidepreventionlifeline.org");
a("www.suicidepreventionlifeline.org");

R = new RuleSet("National Vulvodynia Association");
R.rules.push(new Rule("^(http://(www\\.)?|https://)nva\\.org/", "https://www.nva.org/"));
a("nva.org");
a("www.nva.org");

R = new RuleSet("Nattstad.se");
R.rules.push(new Rule("^http://www\\.nattstad\\.se/", "https://www.nattstad.se/"));
R.rules.push(new Rule("^http://nattstad\\.se/", "https://www.nattstad.se/"));
a("nattstad.se");
a("www.nattstad.se");

R = new RuleSet("Natural Environment Research Council (partial)");
R.rules.push(new Rule("^http://hds\\.nerc\\.ac\\.uk/", "https://hds.nerc.ac.uk/"));
a("hds.nerc.ac.uk");

R = new RuleSet("Naturvardsverket.se");
R.rules.push(new Rule("^http://www\\.naturvardsverket\\.se/", "https://www.naturvardsverket.se/"));
R.rules.push(new Rule("^http://naturvardsverket\\.se/", "https://naturvardsverket.se/"));
a("naturvardsverket.se");
a("www.naturvardsverket.se");

R = new RuleSet("Naukri");
R.rules.push(new Rule("^http://login\\.naukri\\.com/", "https://login.naukri.com/"));
a("login.naukri.com");

R = new RuleSet("Nearbuysystems.com");
R.rules.push(new Rule("^http://luneta\\.nearbuysystems\\.com/", "https://luneta.nearbuysystems.com/"));
a("luneta.nearbuysystems.com");

R = new RuleSet("NearlyFreeSpeech.NET");
R.rules.push(new Rule("^http://(www\\.)?nearlyfreespeech\\.net/", "https://www.nearlyfreespeech.net/"));
R.rules.push(new Rule("^http://members\\.nearlyfreespeech\\.net/", "https://members.nearlyfreespeech.net/"));
a("nearlyfreespeech.net");
a("members.nearlyfreespeech.net");
a("www.nearlyfreespeech.net");

R = new RuleSet("NeatoShop.com");
R.rules.push(new Rule("^http://((?:static\\.)|www\\.)?neatoshop\\.com/", "https://$1neatoshop.com/"));
a("neatoshop.com");
a("*.neatoshop.com");

R = new RuleSet("Northeast Credit Union");
R.rules.push(new Rule("^http://([^/:@]*)\\.necuhb\\.org/", "https://$1.necuhb.org/"));
R.rules.push(new Rule("^https://(www\\.)?necu\\.org/", "https://$1.necu.org/"));
a("necuhb.org");
a("necu.org");
a("www.necu.org");
a("*.necuhb.org");

R = new RuleSet("NedLinux.com");
R.rules.push(new Rule("^http://(www\\.)?nccc\\.nl/", "https://www.nccc.nl/"));
R.rules.push(new Rule("^http://(www\\.)?nedlinux\\.com/", "https://nedlinux.com/"));
R.rules.push(new Rule("^http://webmail\\.nedlinux\\.com/", "https://webmail.nedlinux.com/"));
a("nccc.nl");
a("www.nccc.nl");
a("nedlinux.com");
a("webmail.nedlinux.com");
a("www.nedlinux.com");

R = new RuleSet("NL Overheid");
R.rules.push(new Rule("^http://(?:www\\.)?([\\w-]+)\\.nl/", "https://www.$1.nl/"));
a("digid.nl");
a("www.digid.nl");
a("overheid.nl");
a("www.overheid.nl");
a("internetconsultatie.nl");
a("www.internetconsultatie.nl");
a("werkenbijdeoverheid.nl");
a("www.werkenbijdeoverheid.nl");
a("nationaleombudsman.nl");
a("www.nationaleombudsman.nl");
a("govcert.nl");
a("www.govcert.nl");
a("politie.nl");
a("www.politie.nl");
a("depolitiezoekt.nl");
a("www.depolitiezoekt.nl");
a("minbzk.nl");
a("www.minbzk.nl");
a("waarschuwingsdienst.nl");
a("www.waarschuwingsdienst.nl");
a("bprbzk.nl");
a("www.bprbzk.nl");
a("minfin.nl");
a("www.minfin.nl");
a("domeinenrz.nl");
a("www.domeinenrz.nl");
a("justitie.nl");
a("www.justitie.nl");
a("cjib.nl");
a("www.cjib.nl");
a("wodc.nl");
a("www.wodc.nl");
a("forensischinstituut.nl");
a("www.forensischinstituut.nl");
a("hetlnvloket.nl");
a("www.hetlnvloket.nl");
a("donorregister.nl");
a("www.donorregister.nl");
a("brabant.nl");
a("www.brabant.nl");
a("overijssel.nl");
a("www.overijssel.nl");
a("zeeland.nl");
a("www.zeeland.nl");
a("aaenhunze.nl");
a("www.aaenhunze.nl");
a("amersfoort.nl");
a("www.amersfoort.nl");
a("amstelveen.nl");
a("www.amstelveen.nl");
a("amsterdam.nl");
a("www.amsterdam.nl");
a("bergenopzoom.nl");
a("www.bergenopzoom.nl");
a("gemeenteberkelland.nl");
a("www.gemeenteberkelland.nl");
a("gemeentebest.nl");
a("www.gemeentebest.nl");
a("boarnsterhim.nl");
a("www.boarnsterhim.nl");
a("borne.nl");
a("www.borne.nl");
a("coevorden.nl");
a("www.coevorden.nl");
a("doesburg.nl");
a("www.doesburg.nl");
a("duiven.nl");
a("www.duiven.nl");
a("elburg.nl");
a("www.elburg.nl");
a("geldermalsen.nl");
a("www.geldermalsen.nl");
a("haaksbergen.nl");
a("www.haaksbergen.nl");
a("haarlemmermeer.nl");
a("www.haarlemmermeer.nl");
a("heerenveen.nl");
a("www.heerenveen.nl");
a("s-hertogenbosch.nl");
a("www.s-hertogenbosch.nl");
a("heusden.nl");
a("www.heusden.nl");
a("hilversum.nl");
a("www.hilversum.nl");
a("hoorn.nl");
a("www.hoorn.nl");
a("horstaandemaas.nl");
a("www.horstaandemaas.nl");
a("houten.nl");
a("www.houten.nl");
a("huizen.nl");
a("www.huizen.nl");
a("lochem.nl");
a("www.lochem.nl");
a("maarssen.nl");
a("www.maarssen.nl");
a("maastricht.nl");
a("www.maastricht.nl");
a("meerssen.nl");
a("www.meerssen.nl");
a("middelburg.nl");
a("www.middelburg.nl");
a("middendrenthe.nl");
a("www.middendrenthe.nl");
a("moerdijk.nl");
a("www.moerdijk.nl");
a("gemeentenoordenveld.nl");
a("www.gemeentenoordenveld.nl");
a("noordwijkerhout.nl");
a("www.noordwijkerhout.nl");
a("oldebroek.nl");
a("www.oldebroek.nl");
a("opsterland.nl");
a("www.opsterland.nl");
a("oss.nl");
a("www.oss.nl");
a("pijnacker-nootdorp.nl");
a("www.pijnacker-nootdorp.nl");
a("renkum.nl");
a("www.renkum.nl");
a("rheden.nl");
a("www.rheden.nl");
a("rijswijk.nl");
a("www.rijswijk.nl");
a("schiedam.nl");
a("www.schiedam.nl");
a("schijndel.nl");
a("www.schijndel.nl");
a("sittard-geleen.nl");
a("www.sittard-geleen.nl");
a("smallingerland.nl");
a("www.smallingerland.nl");
a("stedebroec.nl");
a("www.stedebroec.nl");
a("steenwijkerland.nl");
a("www.steenwijkerland.nl");
a("terneuzen.nl");
a("www.terneuzen.nl");
a("teylingen.nl");
a("www.teylingen.nl");
a("tubbergen.nl");
a("www.tubbergen.nl");
a("uden.nl");
a("www.uden.nl");
a("utrecht.nl");
a("www.utrecht.nl");
a("vlagtwedde.nl");
a("www.vlagtwedde.nl");
a("vlissingen.nl");
a("www.vlissingen.nl");
a("wageningen.nl");
a("www.wageningen.nl");
a("weert.nl");
a("www.weert.nl");
a("gemeentewesterveld.nl");
a("www.gemeentewesterveld.nl");
a("gemeentewestland.nl");
a("www.gemeentewestland.nl");
a("wierden.nl");
a("www.wierden.nl");
a("wijchen.nl");
a("www.wijchen.nl");
a("winterswijk.nl");
a("www.winterswijk.nl");
a("zaltbommel.nl");
a("www.zaltbommel.nl");
a("zandvoort.nl");
a("www.zandvoort.nl");
a("zeist.nl");
a("www.zeist.nl");
a("zutphen.nl");
a("www.zutphen.nl");
a("zwijndrecht.nl");
a("www.zwijndrecht.nl");

R = new RuleSet("Neelwafurat.com");
R.rules.push(new Rule("^http://(www\\.)?neelwafurat\\.com/", "https://$1neelwafurat.com/"));
a("neelwafurat.com");
a("www.neelwafurat.com");

R = new RuleSet("Neg9.org");
R.rules.push(new Rule("^http://neg9\\.org/", "https://neg9.org/"));
a("neg9.org");

R = new RuleSet("Nelly.com");
R.rules.push(new Rule("^http://www\\.nelly\\.com/", "https://nelly.com/"));
R.rules.push(new Rule("^http://nelly\\.com/", "https://nelly.com/"));
a("www.nelly.com");
a("nelly.com");

R = new RuleSet("NemID");
R.rules.push(new Rule("^http://(www\\.)?nemid\\.nu/", "https://$1nemid.nu/"));
a("nemid.nu");
a("*.nemid.nu");

R = new RuleSet("Net Communities (partial)");
R.rules.push(new Rule("^http://cdn\\.itproportal\\.com/", "https://itpp.s3.amazonaws.com/"));
a("cdn.itproportal.com");

R = new RuleSet("Net Dynamics (partial)");
R.rules.push(new Rule("^http://(www\\.)?p3pwiz\\.com/", "https://$1p3pwiz.com/"));
a("p3pwiz.com");
a("www.p3pwiz.com");

R = new RuleSet("net-security.org");
R.rules.push(new Rule("^http://www\\.net-security\\.org/", "https://www.net-security.org/"));
R.rules.push(new Rule("^http://net-security\\.org/", "https://net-security.org/"));
a("www.net-security.org");
a("net-security.org");

R = new RuleSet("NetApp (partial)");
R.rules.push(new Rule("^http://(\\w+)\\.netapp\\.com/", "https://$1.netapp.com/"));
a("communities.netapp.com");
a("fieldportal.netapp.com");
a("login.netapp.com");
a("now.netapp.com");

R = new RuleSet("NetBeans (partial)");
R.rules.push(new Rule("^http://forums\\.netbeans\\.org/", "https://forums.netbeans.org/"));
a("forums.netbeans.org");

R = new RuleSet("NetDNA (partial)");
R.rules.push(new Rule("^http://(login\\.|www\\.)?hddn\\.com/", "https://$1hddn.com/"));
R.rules.push(new Rule("^http://secure\\.maxcdn\\.com/", "https://secure.maxcdn.com/"));
R.rules.push(new Rule("^http://blog\\.maxcdn\\.com/wp-content/themes/Akdesigner2/", "https://www.maxcdn.com/wp-content/themes/AKD2/"));
R.rules.push(new Rule("^http://blog\\.maxcdn\\.com/wp-content/plugins/lytebox/", "https://www.maxcdn.com/wp-content/plugins/lytebox/"));
R.rules.push(new Rule("^http://login\\.netdna\\.com/", "https://login.netdna.com/"));
a("hddn.com");
a("*.hddn.com");
a("*.maxcdn.com");
a("login.netdna.com");

R = new RuleSet("netPR (partial)");
R.rules.push(new Rule("^http://secure\\.netpr\\.pl/", "https://secure.netpr.pl/"));
a("secure.netpr.pl");

R = new RuleSet("Netbeat Webmail");
R.rules.push(new Rule("^http://(www\\.)?netbeat\\.de/webmail/", "https://www.netbeat.de/webmail/"));
a("netbeat.de");
a("www.netbeat.de");

R = new RuleSet("Netdoktor.se");
R.rules.push(new Rule("^http://www\\.netdoktor\\.se/", "https://www.netdoktor.se/"));
R.rules.push(new Rule("^http://netdoktor\\.se/", "https://www.netdoktor.se/"));
a("www.netdoktor.se");
a("netdoktor.se");

R = new RuleSet("Netelligent (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?netelligent\\.ca/", "https://$1netelligent.ca/"));
a("netelligent.ca");
a("iam.netelligent.ca");
a("www.netelligent.ca");

R = new RuleSet("Nether");
R.rules.push(new Rule("^http://puck\\.nether\\.net/", "https://puck.nether.net/"));
a("puck.nether.net");

R = new RuleSet("Nets DanID");
R.rules.push(new Rule("^http://(www\\.)?nets-danid\\.dk/", "https://$1nets-danid.dk/"));
a("nets-danid.dk");
a("www.nets-danid.dk");

R = new RuleSet("Nettica");
R.rules.push(new Rule("^http://(?:www\\.)?nettica\\.com/", "https://www.nettica.com/"));
a("nettica.com");
a("www.netteca.com");

R = new RuleSet("Netvibes.com");
R.rules.push(new Rule("^http://(www\\.)?netvibes\\.net/", "https://www.netvibes.net/"));
a("netvibes.com");
a("www.netvibes.com");

R = new RuleSet("Network Redux");
R.rules.push(new Rule("^http://(www\\.)?networkredux\\.com/", "https://networkredux.com/"));
a("networkredux.com");
a("www.networkredux.com");

R = new RuleSet("Network Solutions");
R.rules.push(new Rule("^http://(?:www\\.)?networksolutions\\.com(:443)?/", "https://www.networksolutions.com$1/"));
R.rules.push(new Rule("^http://about\\.networksolutions\\.com/", "https://about.networksolutions.com/"));
R.rules.push(new Rule("^https?://amp\\.networksolutions\\.com/$", "https://www.networksolutions.com/"));
R.rules.push(new Rule("^https?://amp\\.networksolutions\\.com/landing\\?code=(\\w+)$", "https://www.networksolutions.com/affiliates/select-unknown.jsp?siteid=100&channelid=$1"));
a("networksolutions.com");
a("*.networksolutions.com");

R = new RuleSet("Network for Good (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?networkforgood\\.org/", "https://$1networkforgood.org/$1"));
R.exclusions.push(new Exclusion("http://(www\\.)?networkforgood\\.org/$"));
a("networkforgood.org");
a("*.networkforgood.org");

R = new RuleSet("NetworkWorld");
R.rules.push(new Rule("^http://(?:www\\.)?networkworld\\.com/", "https://www.networkworld.com/"));
R.rules.push(new Rule("^http://(www\\.)?subscribenww\\.com/", "https://$1subscribenww.com/"));
a("networkworld.com");
a("*.networkworld.com");
a("subscribenww.com");
a("*.subscribenww.com");

R = new RuleSet("Netzpolitik.org");
R.rules.push(new Rule("^http://(?:www\\.)?netzpolitik\\.org/", "https://netzpolitik.org/"));
a("netzpolitik.org");
a("www.netzpolitik.org");

R = new RuleSet("Neudesic Media Group (partial)");
R.rules.push(new Rule("^http://ads\\.neudesicmediagroup\\.com/", "https://ads.neudesicmediagroup.com/"));
a("ads.neudesicmediagroup.com");
a("*.ads.neudesicmediagroup.com");

R = new RuleSet("New Moon Girls Online");
R.rules.push(new Rule("^http://(www\\.)?newmoon\\.com/", "https://www.newmoon.com/"));
a("newmoon.com");
a("www.newmoon.com");

R = new RuleSet("New York University (partial)");
R.rules.push(new Rule("^http://cs\\.nyu\\.edu/", "https://cs.nyu.edu/"));
a("cs.nyu.edu");

R = new RuleSet("NewIT");
R.rules.push(new Rule("^http://(?:www\\.)?newit\\.co\\.uk/", "https://newit.co.uk/"));
a("newit.co.uk");
a("www.newit.co.uk");

R = new RuleSet("NewScientist.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?newscientist\\.com/(css|img)/", "https://www.newscientist.com/$2/"));
R.rules.push(new Rule("^http://(www\\.)?newscientist\\.com/currentcover\\.jpg", "https://subscribe.newscientist.com/Images/NS/currentcover.jpg"));
R.rules.push(new Rule("^http://subscribe\\.newscientist\\.com/", "https://subscribe.newscientist.com/"));
a("newscientist.com");
a("subscribe.newscientist.com");
a("www.newscientist.com");

R = new RuleSet("Newgrounds (partial)");
R.rules.push(new Rule("^http://(www\\.)?newgrounds\\.com/", "https://www.newgrounds.com/"));
a("newgrounds.com");
a("www.newgrounds.com");

R = new RuleSet("News Corporation (partial)");
R.rules.push(new Rule("^http://(www\\.)?efinancialnews\\.com/(about-us/tour/|css/|img/|js/|login/|forgot-password|register)", "https://$1efinancialnews.com/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?fins\\.com/Finance/(css/|Images/)", "https://www.fins.com/Finance/$1"));
R.rules.push(new Rule("^http://secure\\.nypost\\.com/", "https://secure.nypost.com/"));
R.rules.push(new Rule("^http://\\w+\\.wsj\\.com/(favicon\\.ico|img/|j20type\\.css|static_html_files/)", "https://s.wsj.net/$1"));
R.rules.push(new Rule("^http://barrons\\.wsj\\.net/", "https://s2.wsj.net/"));
R.rules.push(new Rule("^http://(classifieds|customercenter)\\.wsj\\.com/", "https://buy.wsj.com/"));
R.rules.push(new Rule("^http://(m|s[1-4i]?)?\\.wsj\\.net/", "https://$1.wsj.net/"));
R.rules.push(new Rule("^http://sc\\.wsj\\.net/css/(standalone_partner_hat|teublog|wsjblog(_global(_2|_static)?)?)\\.css", "https://sc.wsj.net/css/$1.css"));
R.rules.push(new Rule("^http://services\\.wsj(e)?\\.com/", "https://services.wsj$1.com/"));
R.rules.push(new Rule("^http://(www\\.)?wsjeuropesubs\\.com/", "https://$1wsjeuropesubs.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?wsjsafehouse\\.com/", "https://www.wsjsafehouse.com/"));
R.exclusions.push(new Exclusion("http://bc\\.wsj\\.net/"));
a("efinancialnews.com");
a("www.efinancialnews.com");
a("fins.com");
a("www.fins.com");
a("secure.nypost.com");
a("*.wsj.com");
a("*.wsj.net");
a("services.wsje.com");
a("wsjeuropesubs.com");
a("*.wsjeuropesubs.com");
a("wsjsafehouse.com");
a("*.wsjsafehouse.com");

R = new RuleSet("NewsBlur");
R.rules.push(new Rule("^http://(www\\.)?newsblur\\.com/", "https://www.newsblur.com/"));
a("www.newsblur.com");
a("newsblur.com");

R = new RuleSet("NewsGator");
R.rules.push(new Rule("^http://(?:www\\.)?newsgator\\.com/", "https://www.newsgator.com/"));
a("newsgator.com");
a("www.newsgator.com");

R = new RuleSet("newsvine.com");
R.rules.push(new Rule("^http://newsvine\\.com/", "https://www.newsvine.com/"));
R.rules.push(new Rule("^http://www\\.newsvine\\.com/", "https://www.newsvine.com/"));
a("newsvine.com");

R = new RuleSet("Newzbin");
R.rules.push(new Rule("^http://(?:www\\.)?newzbin(\\.com|2\\.es)/?", "https://www.newzbin2.es/"));
R.rules.push(new Rule("^http://docs\\.newzbin2\\.es/?", "https://docs.newzbin2.es/"));
a("newzbin.com");
a("newzbin2.es");
a("*.newzbin.com");
a("*.newzbin2.es");

R = new RuleSet("Nexcess (partial)");
R.rules.push(new Rule("^http://(affiliates\\.|blog\\.|docs\\.|portal\\.|static\\.|www\\.)?nexcess\\.net/", "https://$1nexcess.net/"));
a("nexcess.net");
a("*.nexcess.net");

R = new RuleSet("Next Update (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?sifterapp\\.com/", "https://$1sifterapp.com/"));
R.exclusions.push(new Exclusion("^http://(journal|status)\\."));
a("sifterapp.com");
a("*.sifterapp.com");

R = new RuleSet("Next");
R.rules.push(new Rule("^http://(?:www\\.)?next\\.co\\.uk/", "https://www.next.co.uk/"));
a("next.co.uk");
a("www.next.co.uk");

R = new RuleSet("NextBus");
R.rules.push(new Rule("^http://(?:www\\.)?nextbus\\.com/", "https://www.nextbus.com/"));
a("nextbus.com");
a("www.nextbus.com");

R = new RuleSet("CZ.NIC");
R.rules.push(new Rule("^http://((?:www|labs|git|blog)\\.)?nic\\.cz/", "https://$1nic.cz/"));
a("nic.cz");
a("www.nic.cz");
a("labs.nic.cz");
a("git.nic.cz");
a("blog.nic.cz");

R = new RuleSet("NicAc");
R.rules.push(new Rule("^http://(?:www\\.)?nic\\.ac/", "https://www.nic.ac/"));
a("nic.ac");
a("www.nic.ac");

R = new RuleSet("NicIo");
R.rules.push(new Rule("^http://(?:www\\.)?nic\\.io/", "https://www.nic.io/"));
a("nic.io");
a("www.nic.io");

R = new RuleSet("Nicotine Anonymous");
R.rules.push(new Rule("^http://(?:www\\.)?nicotine-anonymous\\.org/", "https://nicotine-anonymous.org/"));
R.rules.push(new Rule("^https://www\\.nicotine-anonymous\\.org/", "https://nicotine-anonymous.org/"));
a("nicotine-anonymous.org");
a("www.nicotine-anonymous.org");

R = new RuleSet("nine-2-one");
R.rules.push(new Rule("^http://(www\\.)?nine-2-one\\.com/", "https://$1nine-2-one.com/"));
a("nine-2-one.com");
a("www.nine-2-one.com");

R = new RuleSet("Ninite");
R.rules.push(new Rule("^http://(?:www\\.)?ninite\\.com/", "https://ninite.com/"));
a("ninite.com");
a("www.ninite.com");

R = new RuleSet("Nintendo.com");
R.rules.push(new Rule("^http://nintendo\\.com/", "https://nintendo.com/"));
R.rules.push(new Rule("^http://www\\.nintendo\\.com/", "https://www.nintendo.com/"));
a("nintendo.com");
a("www.nintendo.com");

R = new RuleSet("No Deep Packet Inspection campaign");
R.rules.push(new Rule("^http://(?:www\\.)?nodpi\\.org/", "https://nodpi.org/"));
a("nodpi.org");
a("www.nodpi.org");

R = new RuleSet("Nodejitsu.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?(blog\\.|legal\\.)?nodejitsu\\.com/", "https://$2nodejitsu.com/"));
a("nodejitsu.com");
a("blog.nodejitsu.com");
a("legal.nodejitsu.com");
a("www.nodejitsu.com");

R = new RuleSet("Noisebridge");
R.rules.push(new Rule("^http://(?:www\\.)?noisebridge\\.net/", "https://www.noisebridge.net/"));
a("www.noisebridge.net");
a("noisebridge.net");

R = new RuleSet("Nokia");
R.rules.push(new Rule("^http://(?:www\\.)?nokia\\.com/", "https://www.nokia.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?nokiausa\\.com/", "https://www.nokiausa.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?nokia\\.co\\.uk/", "https://www.nokia.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?nokia\\.ca/", "https://www.nokia.ca/"));
R.rules.push(new Rule("^http://(?:www\\.)?nokia\\.fr/", "https://www.nokia.fr/"));
R.rules.push(new Rule("^http://(?:www\\.)?nokia\\.de/", "https://www.nokia.de/"));
R.rules.push(new Rule("^http://qt\\.nokia\\.com/", "https://qt.nokia.com/"));
R.rules.push(new Rule("^http://(blog|developer)\\.qt\\.nokia\\.com/", "https://$1.qt.nokia.com/"));
R.rules.push(new Rule("^http://(www\\.)?developer\\.nokia\\.com/", "https://www.developer.nokia.com/"));
a("nokia.com");
a("www.nokia.com");
a("nokiausa.com");
a("www.nokiausa.com");
a("nokia.co.uk");
a("www.nokia.co.uk");
a("nokia.ca");
a("www.nokia.ca");
a("nokia.fr");
a("www.nokia.fr");
a("nokia.de");
a("www.nokia.de");
a("qt.nokia.com");
a("blog.qt.nokia.com");
a("developer.qt.nokia.com");
a("developer.nokia.com");
a("www.developer.nokia.com");

R = new RuleSet("Nordea");
R.rules.push(new Rule("^http://(?:www\\.)?nordea\\.(com|dk|ee|fi|lv|no|se)/", "https://www.nordea.$1/"));
a("www.nordea.*");
a("nordea.*");

R = new RuleSet("NordicHardware");
R.rules.push(new Rule("^http://(www\\.)?nhw\\.se/", "https://www.nordichardware.se/"));
R.rules.push(new Rule("^http://(www\\.)?nordichardware\\.(com|se)/", "https://www.nordichardware.$2/"));
a("nhw.se");
a("www.nhw.se");
a("nordichardware.com");
a("www.nordichardware.com");
a("nordichardware.se");
a("www.nordichardware.se");

R = new RuleSet("Nordnet.se");
R.rules.push(new Rule("^http://www\\.nordnet\\.se/", "https://www.nordnet.se/"));
R.rules.push(new Rule("^http://nordnet\\.se/", "https://www.nordnet.se/"));
a("www.nordnet.se");
a("nordnet.se");

R = new RuleSet("Nordu.net");
R.rules.push(new Rule("^http://www\\.nordu\\.net/", "https://www.nordu.net/"));
R.rules.push(new Rule("^http://nordu\\.net/", "https://www.nordu.net/"));
a("nordu.net");
a("www.nordu.net");

R = new RuleSet("noris.net");
R.rules.push(new Rule("^http://((mail|monitor|service)\\.)?(www\\.)?noris\\.net/", "https://$1noris.net/"));
a("noris.net");
a("mail.noris.net");
a("monitor.noris.net");
a("service.noris.net");
a("www.noris.net");

R = new RuleSet("Norman.com");
R.rules.push(new Rule("^http://www\\.norman\\.com/", "https://www.norman.com/"));
R.rules.push(new Rule("^http://norman\\.com/", "https://norman.com/"));
a("norman.com");
a("www.norman.com");

R = new RuleSet("North Carolina State University (partial)");
R.rules.push(new Rule("^http://libraryh3lp\\.com/", "https://libraryh3lp.com/"));
R.rules.push(new Rule("^http://(jobs|(my\\.|staff\\.|www\\.)?lib|oit|portalsp\\.acs|ssl|webauth)\\.ncsu\\.edu/", "https://$1.ncsu.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?ncsu\\.edu/directory/", "https://www.ncsu.edu/directory/"));
a("libraryh3lp.com");
a("ncsu.edu");
a("*.ncsu.edu");
a("www.*.ncsu.edu");

R = new RuleSet("Northpole.fi");
R.rules.push(new Rule("^http://(?:www\\.)?northpole\\.fi/", "https://northpole.fi/"));
a("northpole.fi");
a("www.northpole.fi");

R = new RuleSet("Norwegian.com");
R.rules.push(new Rule("^http://www\\.norwegian\\.com/", "https://www.norwegian.com/"));
R.rules.push(new Rule("^http://norwegian\\.com/", "https://www.norwegian.com/"));
a("www.norwegian.com");
a("norwegian.com");

R = new RuleSet("NottinghamAC");
R.rules.push(new Rule("^http://((www|jobs|email|owa|jobs)\\.)?nottingham\\.ac\\.uk/", "https://$1nottingham.ac.uk/"));
a("nottingham.ac.uk");
a("www.nottingham.ac.uk");
a("jobs.nottingham.ac.uk");
a("email.nottingham.ac.uk");
a("owa.nottingham.ac.uk");

R = new RuleSet("nrelate (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?nrelate\\.com/wp-content/uploads/2010/10/favicon\\.ico", "https://partners.nrelate.com/wp-content/themes/partners-main/images/favicon.ico"));
R.rules.push(new Rule("^http://(?:www\\.)?nrelate\\.com/wp-content/uploads/2012/01/nrelate\\.png", "https://partners.nrelate.com/wp-content/themes/partners-main/images/logo2.png"));
R.rules.push(new Rule("^http://(?:img(?:cdn)?|static)\\.nrelate\\.com/", "https://img.nrelate.com/"));
R.rules.push(new Rule("^http://partners\\.nrelate\\.com/", "https://partners.nrelate.com/"));
a("nrelate.com");
a("*.nrelate.com");

R = new RuleSet("Nttxstore");
R.rules.push(new Rule("^http://(www\\.)?nttxstore\\.jp/", "https://nttxstore.jp/"));
a("nttxstore.jp");
a("www.nttxstore.jp");

R = new RuleSet("ntwk45.com");
R.rules.push(new Rule("^http://(\\w+)\\.ntwk45\\.com/", "https://$1.ntwk45.com/"));
a("*.ntwk45.com");

R = new RuleSet("NuGet");
R.rules.push(new Rule("^http://nuget\\.org/", "https://nuget.org/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.nuget\\.org/", "https://$1.nuget.org/"));
a("nuget.org");
a("*.nuget.org");

R = new RuleSet("NuevaSync (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?nuevasync\\.com/", "https://www.nuevasync.com/"));
a("nuevasync.com");
a("www.nuevasync.com");

R = new RuleSet("Number Resource Organization");
R.rules.push(new Rule("^http://(www\\.)?nro\\.net/", "https://$1nro.net/"));
a("nro.net");
a("*.nro.net");

R = new RuleSet("NutriCentre");
R.rules.push(new Rule("^http://(?:www\\.)?nutricentre\\.com/", "https://www.nutricentre.com/"));
a("nutricentre.com");
a("www.nutricentre.com");

R = new RuleSet("OAG");
R.rules.push(new Rule("^http://(?:www\\.)?oag\\.com/", "https://www.oag.com/"));
R.rules.push(new Rule("^http://tppro\\.oag\\.com/", "https://tppro.oag.com/"));
a("oag.com");
a("*.oag.com");

R = new RuleSet("OCaml (partial)");
R.rules.push(new Rule("^http://(forge|static)\\.ocamlcore\\.org/", "https://$2.ocamlcore.org/"));
a("forge.ocamlcore.org");
a("lists.ocamlcore.org");

R = new RuleSet("O’Heffernan");
R.rules.push(new Rule("^http://(?:www\\.)?inchinashop\\.com/", "https://pingplanet.squarespace.com/"));
a("inachinashop.com");
a("www.inachinashop.com");

R = new RuleSet("OLPC (partial)");
R.rules.push(new Rule("^http://dev\\.laptop\\.org/", "https://dev.laptop.org/"));
a("dev.laptop.org");

R = new RuleSet("ON24 (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?on24\\.com/", "https://www.on24.com/"));
R.rules.push(new Rule("^http://(event|w)\\.on24\\.com/", "https://$1.on24.com/"));
a("on24.com");
a("*.on24.com");

R = new RuleSet("O’Reilly Media (partial)");
R.rules.push(new Rule("^http://members\\.oreilly\\.com/", "https://members.oreilly.com/"));
R.rules.push(new Rule("^http://shop\\.oreilly\\.com/(images|includes|mod|text)/", "https://shop.oreilly.com/$1/"));
a("*.oreilly.com");

R = new RuleSet("OSADL.org");
R.rules.push(new Rule("^http://(www\\.)?osadl\\.org/", "https://osadl.org/"));
a("osadl.org");
a("www.osadl.org");

R = new RuleSet("US OSHA.gov");
R.rules.push(new Rule("^http://(?:www\\.)?osha\\.gov/", "https://www.osha.gov/"));
R.rules.push(new Rule("^https://osha\\.gov/", "https://www.osha.gov/"));
a("osha.gov");
a("www.osha.gov");

R = new RuleSet("OTAlliance.org");
R.rules.push(new Rule("^http://(www\\.)?otalliance\\.org/", "https://otalliance.org/"));
a("otalliance.org");
a("www.otalliance.org");

R = new RuleSet("OWASP");
R.rules.push(new Rule("^http://(www\\.)?owasp\\.org/", "https://owasp.org/"));
a("owasp.org");
a("www.owasp.org");

R = new RuleSet("Office.co.uk (partial)");
R.rules.push(new Rule("^http://(www\\.)?office\\.co\\.uk/(img|images|javascript|scripts|styles)/", "https://www.office.co.uk/$1/"));
a("office.co.uk");
a("www.office.co.uk");

R = new RuleSet("Officersforbundet.se");
R.rules.push(new Rule("^http://officersforbundet\\.se/", "https://www.officersforbundet.se/"));
R.rules.push(new Rule("^http://www\\.officersforbundet\\.se/", "https://www.officersforbundet.se/"));
a("officersforbundet.se");
a("www.officersforbundet.se");

R = new RuleSet("Ohloh");
R.rules.push(new Rule("^http://(?:www\\.)?ohloh\\.(?:net|com|org)/", "https://www.ohloh.net/"));
a("ohloh.net");
a("www.ohloh.net");
a("ohloh.com");
a("www.ohloh.com");
a("ohloh.org");
a("www.ohloh.org");

R = new RuleSet("OkCupid (partial)");
R.rules.push(new Rule("^http://(?:akcdn\\.okccdn|cdn\\.okcimg)\\.com/media/", "https://www.okcupid.com/flat/media/"));
R.rules.push(new Rule("^http://(?:akincludes\\.okccdn|(ads|includs)\\.okcimg|okcupid)\\.com/", "https://www.okcupid.com/"));
R.rules.push(new Rule("^http://www\\.okcupid\\.com/(about/okcupid|careers|contact-us|daisy|flat/|help/\\w+|legal/terms|login|press/news|w3c/)", "https://www.okcupid.com/$1"));
a("akcdn.okccdn.com");
a("akincludes.okccdn.com");
a("ads.okcimg.com");
a("cdn.okcimg.com");
a("includes.okcimg.com");
a("okcupid.com");
a("www.okcupid.com");

R = new RuleSet("Olark");
R.rules.push(new Rule("^http://(?:www\\.)?olark\\.com/", "https://www.olark.com/"));
R.rules.push(new Rule("^http://(assets|static|[0-9]+-async|)\\.olark\\.com/", "https://$1.olark.com/"));
a("olark.com");
a("*.olark.com");

R = new RuleSet("omNovia Technologies");
R.rules.push(new Rule("^http://omnovia\\.com/", "https://www.omnovia.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.omnovia\\.com/", "https://$1.omnovia.com/"));
a("omnovia.com");
a("*.omnovia.com");

R = new RuleSet("OmniGroup.com");
R.rules.push(new Rule("^http://omnigroup\\.com/", "https://www.omnigroup.com/"));
R.rules.push(new Rule("^http://www\\.omnigroup\\.com/", "https://www.omnigroup.com/"));
a("omnigroup.com");
a("www.omnigroup.com");

R = new RuleSet("Omnitec");
R.rules.push(new Rule("^http://omnitec\\.com/", "https://www.omnitec.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.omnitec\\.com/", "https://$1.omnitec.com/"));
a("omnitec.com");
a("*.omnitec.com");

R = new RuleSet("Omron.com");
R.rules.push(new Rule("^http://(?:www\\.)?omron\\.com/", "https://www.omron.com/"));
a("www.omron.com");
a("omron.com");

R = new RuleSet("one.com");
R.rules.push(new Rule("^http://(?:www\\.)?one\\.com/", "https://www.one.com/"));
a("one.com");
a("www.one.com");

R = new RuleSet("Onehub.com");
R.rules.push(new Rule("^http://(?:www\\.)?onehub\\.com/", "https://onehub.com/"));
a("onehub.com");
a("www.onehub.com");

R = new RuleSet("Online.nl");
R.rules.push(new Rule("^http://(?:www\\.)?online\\.nl/", "https://www.online.nl/"));
R.rules.push(new Rule("^http://registratie\\.online\\.nl/", "https://registratie.online.nl/"));
a("*.online.nl");

R = new RuleSet("Ontario Lung Association");
R.rules.push(new Rule("^http://(?:www\\.)?on\\.lung\\.ca/", "https://www.on.lung.ca/"));
R.rules.push(new Rule("^https://on\\.lung\\.ca/", "https://www.on.lung.ca/"));
a("on.lung.ca");
a("www.on.lung.ca");

R = new RuleSet("OnTrac");
R.rules.push(new Rule("^http://(?:www\\.)?ontrac\\.com/", "https://www.ontrac.com/"));
a("ontrac.com");
a("www.ontrac.com");

R = new RuleSet("ooshirts.com (partial)");
R.rules.push(new Rule("^http://(www\\.|i[12]\\.)?ooshirts\\.com/(css|images)/", "https://www.ooshirts.com/$2/"));
a("ooshirts.com");
a("i1.ooshirts.com");
a("i2.ooshirts.com");
a("www.ooshirts.com");

R = new RuleSet("Ooyala (partial)");
R.rules.push(new Rule("^http://ooyala\\.com/", "https://www.ooyala.com/"));
R.rules.push(new Rule("^http://(backlot|www)\\.ooyala\\.com/", "https://$1.ooyala.com/"));
a("ooyala.com");
a("backlot.ooyala.com");
a("www.ooyala.com");

R = new RuleSet("Open Clipart Library");
R.rules.push(new Rule("^http://(www\\.)?openclipart\\.org/", "https://openclipart.org/"));
a("openclipart.org");
a("www.openclipart.org");

R = new RuleSet("Open-Mesh");
R.rules.push(new Rule("^http://(?:www\\.)?open-mesh\\.com/", "https://www.open-mesh.com/"));
R.rules.push(new Rule("^http://dashboard\\.open-mesh\\.com/", "https://dashboard.open-mesh.com/"));
a("open-mesh.com");
a("www.open-mesh.com");
a("dashboard.open-mesh.com");

R = new RuleSet("OpenAthens (partial)");
R.rules.push(new Rule("^http://auth\\.athensams\\.net/", "https://auth.athensams.net/"));
a("auth.athensams.net");

R = new RuleSet("OpenBSD Europe");
R.rules.push(new Rule("^http://(?:shop\\.)?openbsdeurope\\.com/", "https://shop.openbsdeurope.com/"));
a("openbsdeurope.com");
a("shop.openbsdeurope.com");

R = new RuleSet("OpenDNS");
R.rules.push(new Rule("^http://(?:www\\.)?opendns\\.com/", "https://www.opendns.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.opendns\\.com/", "https://$1.opendns.com/"));
R.rules.push(new Rule("^http://d295hzzivaok4k\\.cloudfront\\.net/", "https://d295hzzivaok4k.cloudfront.net/"));
R.exclusions.push(new Exclusion("^http://screenshots\\.opendns\\.com/"));
R.exclusions.push(new Exclusion("^http://(block|feeds|guide|info|phish)\\.opendns\\.com/"));
a("opendns.com");
a("*.opendns.com");
a("d295hzzivaok4k.cloudfront.net");

R = new RuleSet("OpenID");
R.rules.push(new Rule("^http://(?:www\\.)?openid\\.net/", "https://openid.net/"));
a("openid.net");
a("www.openid.net");

R = new RuleSet("OpenLeaks");
R.rules.push(new Rule("^http://(www\\.)?openleaks\\.org/", "https://$1openleaks.org/"));
a("openleaks.org");
a("www.openleaks.org");

R = new RuleSet("OpenSC Project");
R.rules.push(new Rule("^http://(www\\.)?opensc-project\\.org/", "https://www.opensc-project.org/"));
a("www.opensc-project.org");
a("opensc-project.org");

R = new RuleSet("OpenSSL (partial)");
R.rules.push(new Rule("^http://(rt\\.|www\\.)?openssl\\.org/", "https://$1openssl.org/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?openssl\\.org/(news/changelog|support/faq)\\.html$"));
a("openssl.org");
a("rt.openssl.org");
a("www.openssl.org");

R = new RuleSet("OpenStreetMap Wiki");
R.rules.push(new Rule("^http://openstreetmap\\.org/", "https://www.openstreemap.org/"));
R.rules.push(new Rule("^http://www\\.openstreetmap\\.org/(assets/|login|user/new)", "https://www.openstreetmap.org/$1"));
R.rules.push(new Rule("^http://(piwik|wiki)\\.openstreetmap\\.org/", "https://$1.openstreetmap.org/"));
a("openstreetmap.org");
a("*.openstreetmap.org");

R = new RuleSet("OpenTTD (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?openttd\\.org/", "https://$1openttd.org/"));
R.rules.push(new Rule("^http://\\w+\\.binaries\\.openttd\\.org/", "https://secure.openttd.org/binaries/"));
R.rules.push(new Rule("^http://(blog\\.dev\\.|paste\\.|www\\.)?openttdcoop\\.org/", "https://$1openttdcoop.org/"));
R.exclusions.push(new Exclusion("^http://devs\\.openttd\\.org/"));
a("openttd.org");
a("*.openttd.org");
a("*.binaries.openttd.org");
a("openttdcoop.org");
a("blog.openttdcoop.org");
a("dev.openttdcoop.org");
a("paste.openttdcoop.org");
a("www.openttdcoop.org");

R = new RuleSet("OpenVPN");
R.rules.push(new Rule("^http://(?:www\\.)?openvpn\\.net/", "https://www.openvpn.net/"));
a("openvpn.net");
a("www.openvpn.net");

R = new RuleSet("OpenWRT (partial)");
R.rules.push(new Rule("^http://(www\\.)?openwrt\\.org/", "https://openwrt.org/"));
R.rules.push(new Rule("^http://(dev|forum)\\.openwrt\\.org/", "https://$1.openwrt.org/"));
R.rules.push(new Rule("^http://wiki\\.openwrt\\.org/lib/tpl/ameoto/images/(bg(-2)?|footer|openwrt-logo)\\.png$", "https://openwrt.org/.styles/img/$1.png"));
a("openwrt.org");
a("dev.openwrt.org");
a("forum.openwrt.org");
a("wiki.openwrt.org");
a("www.openwrt.org");

R = new RuleSet("OpenX (partial)");
R.rules.push(new Rule("^http://i-cdn\\.openx\\.com/", "https://i-cdn.openx.com/"));
R.rules.push(new Rule("^http://(d1|developer)\\.openx\\.org/", "https://$1.openx.org/"));
a("i-cdn.openx.com");
a("d1.openx.org");
a("developer.openx.org");

R = new RuleSet("Openhost (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?mycp\\.co\\.nz/", "https://hspc.openhost.net.nz/sign_in.php"));
R.rules.push(new Rule("^http://(www\\.)?openhost\\.(?:co|net)\\.nz/$", "https://$1openhost.net.nz/"));
R.rules.push(new Rule("^http://support\\.webhost\\.co\\.nz/", "https://support.webhost.co.nz/"));
R.rules.push(new Rule("^http://(hspc|store)\\.openhost\\.net\\.nz/", "https://$1.openhost.net.nz/"));
a("mycp.co.nz");
a("www.mycp.co.nz");
a("openhost.co.nz");
a("*.openhost.co.nz");
a("openhost.net.nz");
a("*.openhost.net.nz");

R = new RuleSet("Openprinting");
R.rules.push(new Rule("^http://(www\\.)?openprinting\\.org/", "https://www.openprinting.org/"));
a("www.openprinting.org");
a("openprinting.org");

R = new RuleSet("Optical Society of America (partial)");
R.rules.push(new Rule("^http://o(pticsinfobase|sa)\\.org/", "https://www.o$1.org/"));
R.rules.push(new Rule("^http://www\\.opticsinfobase\\.org/", "https://www.opticsinfobase.org/"));
R.rules.push(new Rule("^http://(account|eweb2|www)\\.osa\\.org/", "https://$1.osa.org/"));
R.exclusions.push(new Exclusion("^http://www\\.osa\\.org/video_library/"));
a("opticsinfobase.org");
a("www.opticsinfobase.org");
a("osa.org");
a("*.osa.org");

R = new RuleSet("Optimal Payments (partial)");
R.rules.push(new Rule("^http://(help\\.|member\\.|merchant\\.|www\\.)?neteller\\.com/", "https://$1neteller.com/"));
R.rules.push(new Rule("^http://(?:(www\\.)?neteller-group|optimalpayments)\\.com/", "https://www.optimalpayments.com/"));
R.rules.push(new Rule("^http://www\\.optimalpayments\\.com/wp-content/", "https://www.optimalpayments.com/wp-content/"));
a("neteller.com");
a("*.neteller.com");
a("neteller-group.com");
a("www.neteller-group.com");
a("optimalpayments.com");
a("www.optimalpayments.com");

R = new RuleSet("Optimizely");
R.rules.push(new Rule("^http://optimizely\\.com/", "https://www.optimizely.com/"));
R.rules.push(new Rule("^http://(cdn|www)\\.optimizely\\.com/", "https://$1.optimizely.com/"));
R.rules.push(new Rule("^https://support\\.optimizely\\.com/(help|pkg|stylesheets)/", "https://asset-2.tenderapp.com/$1"));
a("optimizely.com");
a("*.optimizely.com");

R = new RuleSet("Oracle (partial)");
R.rules.push(new Rule("^https?://oracle\\.com/", "https://www.oracle.com/"));
R.rules.push(new Rule("^http://crmondemand\\.oracle\\.com/", "https://www.oracle.com/us/products/applications/crmondemand/index.html"));
R.rules.push(new Rule("^http://(blogs|education|edelivery|partners|oss|otn|shop|solutions|support|wikis)\\.oracle\\.com/", "https://$1.oracle.com/"));
R.rules.push(new Rule("^https?://oracleimg\\.com/", "https://www.oracleimg.com/"));
R.exclusions.push(new Exclusion("^http://www\\."));
a("oracle.com");
a("*.oracle.com");
a("*.edelivery.oracle.com");

R = new RuleSet("Orange");
R.rules.push(new Rule("^http://(?:www\\.)?orange\\.co\\.uk/", "https://www.orange.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?orange\\.co\\.il/", "https://www.orange.co.il/"));
a("orange.co.uk");
a("www.orange.co.uk");
a("www.orange.co.il");
a("orange.co.il");

R = new RuleSet("Ordbogen.com");
R.rules.push(new Rule("^http://(www\\.)?ordbogen\\.com/", "https://www.ordbogen.com/"));
a("ordbogen.com");
a("www.ordbogen.com");

R = new RuleSet("Oregon State University (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?oregonstate\\.edu/(favicon\\.ico$|u_central/images/)", "https://secure.oregonstate.edu/$1"));
R.rules.push(new Rule("^http://(?:www\\.)?osufoundation\\.org/", "https://osufoundation.org/"));
R.rules.push(new Rule("^http://(www\\.)?osuosl\\.org/", "https://$1osuosl.org/"));
a("oregonstate.edu");
a("www.oregonstate.edu");
a("osufoundation.org");
a("www.osufoundation.org");
a("osuosl.org");
a("*.osuosl.org");

R = new RuleSet("Oron (partial)");
R.rules.push(new Rule("^http://(www\\.)?oron\\.com/(favicon\\.ico$|images/|.+\\.(css|js($|\\?\\d?$))|\\?op=)", "https://secure.oron.com/$2"));
R.rules.push(new Rule("^http://secure\\.oron\\.com/", "https://secure.oron.com/"));
a("oron.com");
a("secure.oron.com");
a("www.oron.com");

R = new RuleSet("os-cillation (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?schweissgut\\.net/", "https://schweissgut.net/"));
a("schweissgut.net");
a("www.schweissgut.net");

R = new RuleSet("Otavamedia (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(?:kuvalehdet|otavamedia)\\.fi/", "https://www.otavamedia.fi/"));
R.rules.push(new Rule("^http://aulis\\.plaza\\.fi/", "https://aulis.plaza.fi/"));
R.rules.push(new Rule("^http://(?:www\\.)plazakauppa\\.fi/", "https://www.plazakauppa.fi/"));
a("kuvalehdet.fi");
a("www.kuvalehdet.fi");
a("otavamedia.fi");
a("www.otavamedia.fi");
a("aulis.plaza.fi");
a("plazakauppa.fi");
a("www.plazakauppa.fi");

R = new RuleSet("Ottospora.nl");
R.rules.push(new Rule("^http://ottospora\\.nl/", "https://ottospora.nl/"));
R.rules.push(new Rule("^http://www\\.ottospora\\.nl/", "https://www.ottospora.nl/"));
a("ottospora.nl");
a("www.ottospora.nl");

R = new RuleSet("OverClockers");
R.rules.push(new Rule("^http://(?:www\\.)?overclockers\\.co\\.uk/", "https://www.overclockers.co.uk/"));
a("overclockers.co.uk");
a("www.overclockers.co.uk");

R = new RuleSet("Overclockers (partial)");
R.rules.push(new Rule("^http://(?:www\\.)ocforums\\.com/", "https://www.overclockers.com/forums/"));
R.rules.push(new Rule("^http://(www\\.)?overclockers\\.com/($|\\w+/)", "https://$1overclockers.com/$2"));
a("ocforums.com");
a("www.ocforums.com");
a("overclockers.com");
a("*.overclockers.com");

R = new RuleSet("Overlake Hospital Medical Center");
R.rules.push(new Rule("^http://(www\\.)?overlakehospital\\.org/", "https://www.overlakehospital.org/"));
a("overlakehospital.org");
a("www.overlakehospital.org");

R = new RuleSet("Oversee.net (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?aboutairportparking\\.com/", "https://www.aboutairportparking.com/"));
R.rules.push(new Rule("^http://(www\\.)?domainfest\\.com/", "https://$1domainfest.com/"));
R.rules.push(new Rule("^http://(pubman\\.|www\\.)?domainsponsor\\.com/", "https://$1domainsponsor.com/"));
R.rules.push(new Rule("^http://(support\\.|www\\.)?oversee\\.net/", "https://$1oversee.net/"));
R.rules.push(new Rule("^http://(www\\.)?shopwiki\\.com/", "https://$1shopwiki.com/"));
a("aboutairportparking.com");
a("www.aboutairportparking.com");
a("domainfest.com");
a("www.domainfest.com");
a("domainsponsor.com");
a("*.domainsponsor.com");
a("oversee.net");
a("*.oversee.net");
a("shopwiki.com");
a("www.shopwiki.com");

R = new RuleSet("OVH");
R.rules.push(new Rule("^http://(?:www\\.)?ovh\\.com/", "https://www.ovh.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?ovh\\.co\\.uk/", "https://www.ovh.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?ovh\\.de/", "https://www.ovh.de/"));
a("ovh.com");
a("www.ovh.com");
a("ovh.co.uk");
a("www.ovh.co.uk");
a("ovh.de");
a("www.ovh.de");

R = new RuleSet("OwnCube");
R.rules.push(new Rule("^http://(?:www\\.)?owncube\\.com/", "https://owncube.com/"));
a("owncube.com");
a("www.owncube.com");

R = new RuleSet("Oxfam Unwrapped");
R.rules.push(new Rule("^http://(?:www\\.)?oxfamirelandunwrapped\\.com/", "https://www.oxfamirelandunwrapped.com/"));
R.rules.push(new Rule("^http://netbel\\.oxfamireland\\.org/", "https://netbel.oxfamireland.org/"));
a("oxfamirelandunwrapped.com");
a("www.oxfamirelandunwrapped.com");
a("netbel.oxfamireland.org");

R = new RuleSet("OzBargain");
R.rules.push(new Rule("^https?://(?:www\\.)?ozbargain\\.com\\.au/", "https://www.ozbargain.com.au/"));
a("ozbargain.com.au");
a("www.ozbargain.com.au");

R = new RuleSet("PANGAEA (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?secure\\.pangaea\\.de/", "https://secure.pangaea.de/"));
a("secure.pangaea.de");
a("www.secure.pangaea.de");

R = new RuleSet("PBA Galleries");
R.rules.push(new Rule("^http://(?:www\\.)?pbagalleries\\.com/", "https://www.pbagalleries.com/"));
a("pbagalleries.com");
a("www.pbagalleries.com");

R = new RuleSet("PBwiki (partial)");
R.rules.push(new Rule("^http://(files|my|(pb-api)?docs|secure|vs1|www)\\.pbworks\\.com/", "https://$1.pbworks.com/"));
R.rules.push(new Rule("^http://usermanual\\.pbworks\\.com/([fw]/|theme_image\\.php)", "https://usermanual.pbworks.com/$1"));
a("*.pbwiki.com");

R = new RuleSet("PBworks (partial)");
R.rules.push(new Rule("^http://vs1\\.pbworks\\.com/", "https://vs1.pbworks.com/"));
a("vs1.pbworks.com");

R = new RuleSet("PCCaseGear");
R.rules.push(new Rule("^https?://(?:www\\.)?pccasegear\\.(?:com|com\\.au)/", "https://www.pccasegear.com/"));
a("pccasegear.com");
a("www.pccasegear.com");
a("pccasegear.com.au");
a("www.pccasegear.com.au");

R = new RuleSet("PC World");
R.rules.push(new Rule("^http://www\\.pcworld\\.com/", "https://www.pcworld.com/"));
a("www.pcworld.com");

R = new RuleSet("PFLAG-Parents, Families, & Friends of Lesbians and Gays (partial)");
R.rules.push(new Rule("^http://((www|community)\\.)?pflag\\.org/", "https://$1pflag.org/"));
a("pflag.org");
a("www.pflag.org");
a("community.pflag.org");

R = new RuleSet("PGP");
R.rules.push(new Rule("^http://(?:www\\.)?pgp\\.com/", "https://www.pgp.com/"));
R.rules.push(new Rule("^http://(keyserver|sstats)\\.pgp\\.com/", "https://$1.pgp.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.store\\.pgp\\.com/", "https://$1.store.pgp.com/"));
a("pgp.com");
a("*.pgp.com");
a("*.store.pgp.com");

R = new RuleSet("PIERS (partial)");
R.rules.push(new Rule("^http://directories\\.piers\\.com/Portals/", "https://directories.piers.com/Portals/"));
a("directories.piers.com");

R = new RuleSet("PNC");
R.rules.push(new Rule("^http://pnc\\.com/", "https://www.pnc.com/"));
R.rules.push(new Rule("^http://(ra|www|www\\.ilink|www\\.recognition)\\.pnc\\.com/", "https://$1.pnc.com/"));
a("pnc.com");
a("*.pnc.com");

R = new RuleSet("POP (partial)");
R.rules.push(new Rule("^http://pop\\.com\\.br/", "https://pop.com.br/"));
R.rules.push(new Rule("^http://www\\.pop\\.com\\.br/_(css|fonts|imagens|swf)/", "https://www.pop.com.br/_$1/"));
a("pop.com.br");
a("www.pop.com.br");

R = new RuleSet("PR Newswire (partial)");
R.rules.push(new Rule("^http://content\\.prnewswire\\.com/designimages/l(ine-horz|ogo-prn)-01_PRN\\.gif", "https://portal.prnewswire.com/images/l$1-01.gif"));
R.rules.push(new Rule("^http://portal\\.prnewswire\\.com/", "https://portal.prnewswire.com/"));
a("content.prnewswire.com");
a("portal.prnewswire.com");

R = new RuleSet("prq.se");
R.rules.push(new Rule("^http://webmail\\.prq\\.se/", "https://webmail.prq.se/"));
R.rules.push(new Rule("^http://kundcenter\\.prq\\.se/", "https://kundcenter.prq.se/"));
a("webmail.prq.se");
a("kundcenter.prq.se");

R = new RuleSet("PRV.se");
R.rules.push(new Rule("^http://www\\.prv\\.se/", "https://www.prv.se/"));
R.rules.push(new Rule("^http://prv\\.se/", "https://www.prv.se/"));
a("prv.se");
a("www.prv.se");

R = new RuleSet("PS-Webhosting Webmail");
R.rules.push(new Rule("^http://webmail\\.planet-school\\.de/", "https://webmail.planet-school.de/"));
a("webmail.planet-school.de");

R = new RuleSet("PageKite");
R.rules.push(new Rule("^http://(?:www\\.)?pagekite\\.net/", "https://pagekite.net/"));
a("www.pagekite.net");
a("pagekite.net");

R = new RuleSet("Pagely (partial)");
R.rules.push(new Rule("^http://(www\\.)?page\\.ly/(favicon\\.ico|public/|signup/|wp-content/)", "https://$1page.ly/$2"));
R.rules.push(new Rule("^http://pagely\\.presscdn\\.com/wp-content/", "https://page.ly/wp-content/"));
a("page.ly");
a("www.page.ly");

R = new RuleSet("PaidContent");
R.rules.push(new Rule("^http://(?:www\\.)?paidcontent\\.org/", "https://paidcontent.org/"));
a("paidcontent.org");
a("www.paidcontent.org");

R = new RuleSet("pair Networks (partial)");
R.rules.push(new Rule("^http://(www\\.)?pair\\.com/static/", "https://$1pair.com/static/"));
R.rules.push(new Rule("^http://(promote|static|(([as]m|my|rc|)\\.)?webmail)\\.pair\\.com/", "https://$1.pair.com/"));
R.rules.push(new Rule("^http://(www\\.)?pairlite\\.com/(images/|signup/|styles01\\.css)", "https://$1pairlite.com/$2"));
R.rules.push(new Rule("^http://(my|webmail)\\.pairlite\\.com/", "https://$1.pairlite.com/"));
R.rules.push(new Rule("^http://(www\\.)?pairnic\\.com/", "https://$1pairnic.com/"));
R.exclusions.push(new Exclusion("http://(cpan|whois)\\.pairnic\\."));
a("pair.com");
a("*.pair.com");
a("*.webmail.pair.com");
a("pairlite.com");
a("*.pairlite.com");
a("pairnic.com");
a("*.pairnic.com");

R = new RuleSet("Palm Coast Data");
R.rules.push(new Rule("^http://s(ecure|sl)\\.palmcoastd\\.com/", "https://s$1.palmcoastd.com/"));
a("secure.palmcoastd.com");
a("ssl.palmcoastd.com");

R = new RuleSet("PamConsult");
R.rules.push(new Rule("^http://(www\\.)?(pamconsult|pamela|pamfax)\\.(biz|com)/", "https://www.$2.$3/"));
R.rules.push(new Rule("^http://s\\.pamfax\\.biz/", "https://s.pamfax.biz/"));
a("pamconsult.com");
a("www.pamconsult.com");
a("pamela.biz");
a("www.pamela.biz");
a("pamfax.biz");
a("s.pamfax.biz");
a("www.pamfax.biz");

R = new RuleSet("Panasonic.com");
R.rules.push(new Rule("^http://(?:www\\.)?panasonic\\.com/", "https://www.panasonic.com/"));
R.rules.push(new Rule("^http://www2\\.panasonic\\.com/", "https://www2.panasonic.com/"));
a("www.panasonic.com");
a("www2.panasonic.com");
a("panasonic.com");

R = new RuleSet("Pandora");
R.rules.push(new Rule("^http://(?:www\\.)?pandora\\.com/", "https://www.pandora.com/"));
a("pandora.com");
a("www.pandora.com");

R = new RuleSet("Panic.com");
R.rules.push(new Rule("^http://(www\\.)?panic\\.com/", "https://$1panic.com/"));
a("panic.com");
a("www.panic.com");

R = new RuleSet("Pantheos (partial)");
R.rules.push(new Rule("^http://(www\\.)?pantheos\\.com/images/", "https://www.pantheos.com/images/"));
R.rules.push(new Rule("^http://(css|media|wp)\\.patheos\\.com/", "https://s3.amazonaws.com/$1.patheos.com/"));
a("pantheos.com");
a("css.pantheos.com");
a("media.pantheos.com");
a("wp.patheos.com");
a("www.pantheos.com");

R = new RuleSet("Paper.li");
R.rules.push(new Rule("^http://(www\\.)?paper\\.li/", "https://paper.li/"));
a("paper.li");
a("www.paper.li");

R = new RuleSet("Paradox Interactive (partial)");
R.rules.push(new Rule("^http://connect\\.paradoxplaza\\.com/", "https://connect.paradoxplaza.com/"));
a("connect.paradoxplaza.com");

R = new RuleSet("Paradysz");
R.rules.push(new Rule("^http://(www\\.)?offeredby\\.net/", "https://$1offeredby.net/"));
a("offeredby.net");
a("www.offeredby.net");

R = new RuleSet("Parallels (partial)");
R.rules.push(new Rule("^http://(www\\.)?parallels\\.com/(favicon\\.ico|file(admin|s)/|r/|typo3(conf|temp)/)", "https://$1.parallels.com/$2"));
R.rules.push(new Rule("^http://blogs\\.parallels\\.com/", "https://parallelsblog.squarespace.com/"));
R.rules.push(new Rule("^http://i3\\.parallels\\.com/", "https://www.parallels.com/"));
R.rules.push(new Rule("^http://store\\.parallels\\.com/", "https://store.parallels.com/"));
a("parallels.com");
a("*.parallels.com");

R = new RuleSet("Parature.com");
R.rules.push(new Rule("^http://(www\\.)?parature\\.com/", "https://www.parature.com/"));
R.rules.push(new Rule("^http://(s3|support)\\.parature\\.com/", "https://$1.parature.com/"));
a("parature.com");
a("s3.parature.com");
a("support.parature.com");
a("www.parature.com");

R = new RuleSet("Pardot (partial)");
R.rules.push(new Rule("^https?://www-cdn\\d\\.pardot\\.com/", "https://www.pardot.com/"));
R.rules.push(new Rule("^http://pardot\\.com/", "https://www.pardot.com/"));
R.rules.push(new Rule("^http://(blog|go|help|pi|www)\\.pardot\\.com/", "https://$1.pardot.com/"));
a("pardot.com");
a("*.pardot.com");

R = new RuleSet("Parship.nl");
R.rules.push(new Rule("^http://www\\.parship\\.nl/", "https://www.parship.nl/"));
a("www.parship.nl");

R = new RuleSet("partypoker");
R.rules.push(new Rule("^http://partypoker\\.com/", "https://www.partypoker.com/"));
R.rules.push(new Rule("^http://www\\.partypoker\\.com/", "https://www.partypoker.com/"));
R.rules.push(new Rule("^http://p\\.iivt\\.com/", "https://p.iivt.com/"));
a("partypoker.com");
a("*.partypoker.com");
a("p.iivt.com");

R = new RuleSet("PassThePopcorn");
R.rules.push(new Rule("^http://passthepopcorn\\.me/", "https://passthepopcorn.me/"));
a("passthepopcorn.me");

R = new RuleSet("PasswordCard");
R.rules.push(new Rule("^http://(?:www\\.)?passwordcard\\.org/", "https://www.passwordcard.org/"));
a("passwordcard.org");
a("www.passwordcard.org");

R = new RuleSet("Pastebin.ca");
R.rules.push(new Rule("^http://(?:www\\.)?pastebin\\.ca/", "https://pastebin.ca/"));
a("pastebin.ca");
a("www.pastebin.ca");

R = new RuleSet("Pastebin.com");
R.rules.push(new Rule("^http://(www\\.)?pastebin\\.com/(raw\\.php|cache/|etc/|i/|favicon\\.ico$)", "https://$1pastebin.com/$2"));
a("pastebin.com");
a("www.pastebin.com");

R = new RuleSet("Pastee.org");
R.rules.push(new Rule("^http://(?:www\\.)?pastee\\.org/", "https://pastee.org/"));
a("pastee.org");
a("www.pastee.org");

R = new RuleSet("Pay.gov");
R.rules.push(new Rule("^http://(([a-zA-Z0-9\\-])+\\.)?pay\\.gov/", "https://$1pay.gov/"));
a("pay.gov");
a("*.pay.gov");

R = new RuleSet("PayPal");
R.rules.push(new Rule("^http://(?:www\\.)?paypal\\.co(m|\\.uk)/", "https://www.paypal.co$1/"));
R.rules.push(new Rule("^http://images\\.paypal\\.com/", "https://images.paypal.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?paypalobjects\\.com/", "https://www.paypalobjects.com/"));
a("paypal.com");
a("images.paypal.com");
a("www.paypal.com");
a("paypal.co.uk");
a("www.paypal.co.uk");
a("paypalobjects.com");
a("www.paypalobjects.com");

R = new RuleSet("Paycheckrecords.com");
R.rules.push(new Rule("^http://(www\\.)?paycheckrecords\\.com/", "https://www.paycheckrecords.com/"));
a("www.paycheckrecords.com");
a("paycheckrecords.com");

R = new RuleSet("Pearson (partial)");
R.rules.push(new Rule("^http://informit\\.com/", "https://www.informit.com/"));
R.rules.push(new Rule("^http://(memberservices|www)\\.informit\\.com/", "https://$1.informit.com/"));
R.rules.push(new Rule("^http://register\\.pearsoncmg\\.com/", "https://register.pearsoncmg.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?(?:pearson)?vue\\.com/", "https://www8.pearsonvue.com/"));
a("informit.com");
a("*.informit.com");
a("register.pearsoncmg.com");
a("pearsonvue.com");
a("www.pearsonvue.com");
a("vue.com");
a("www.vue.com");

R = new RuleSet("Regional Municipality of Peel, Canada");
R.rules.push(new Rule("^http://(?:www\\.)?peelregion\\.ca/", "https://www.peelregion.ca/"));
R.rules.push(new Rule("^https://peelregion\\.ca/", "https://www.peelregion.ca/"));
a("peelregion.ca");
a("www.peelregion.ca");

R = new RuleSet("Peepd.com (partial)");
R.rules.push(new Rule("^http://www\\.peepd\\.com/", "https://peepd.com/"));
R.rules.push(new Rule("^http://peepd\\.com/(images/|index\\.php|skins/)", "https://peepd.com/$1"));
a("peepd.com");
a("www.peepd.com");

R = new RuleSet("Peninsula Library System (partial)");
R.rules.push(new Rule("^http://(catalog|ezproxy)\\.plsinfo\\.org/", "https://$1.plsinfo.org/"));
R.rules.push(new Rule("^http://plsiii\\.plsinfo\\.org/", "https://catalog.plsinfo.org/"));
a("catalog.plsinfo.org");
a("ezproxy.plsinfo.org");
a("plsiii.plsinfo.org");

R = new RuleSet("PensionsMyndigheten.se");
R.rules.push(new Rule("^http://www\\.pensionsmyndigheten\\.se/", "https://secure.pensionsmyndigheten.se/"));
R.rules.push(new Rule("^http://pensionsmyndigheten\\.se/", "https://secure.pensionsmyndigheten.se/"));
a("pensionsmyndigheten.se");
a("www.pensionsmyndigheten.se");

R = new RuleSet("Performancing (partial)");
R.rules.push(new Rule("^http://pmetrics\\.performancing\\.com/", "https://pmetrics.performancing.com/"));
a("pmetrics.performancing.com");

R = new RuleSet("Pearl Foundation (partial)");
R.rules.push(new Rule("^http://donate\\.perlfoundation\\.org/", "https://donate.perlfoundation.org/"));
a("donate.perlfoundation.org");

R = new RuleSet("Petridish (partial)");
R.rules.push(new Rule("^http://media\\.petridish\\.org/", "https://s3.amazonaws.com/media.petridish.org/"));
a("media.petridish.org");

R = new RuleSet("Pets at Home");
R.rules.push(new Rule("^http://(www\\.)?petsathome\\.com/", "https://www.petsathome.com/"));
a("petsathome.com");
a("www.petsathome.com");

R = new RuleSet("Pfizer (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?pfizer(helpfulanswers)?\\.com/", "https://www.pfizer$1.com/"));
R.rules.push(new Rule("^http://animalhealth\\.pfizer\\.com/", "https://animalhealth.pfizer.com/"));
R.rules.push(new Rule("^http://(www\\.)?pfizerpro\\.com/", "https://$1pfizerpro.com/"));
a("pfizer.com");
a("*.pfizer.com");
a("pfizerpro.com");
a("*.pfizerpro.com");
a("pfizerhelpfulanswers.com");
a("*.pfizerhelpfulanswers.com");

R = new RuleSet("PhishTank");
R.rules.push(new Rule("^http://(?:www\\.)?phishtank\\.com/", "https://www.phishtank.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?data\\.phishtank\\.com/", "https://data.phishtank.com/"));
a("phishtank.com");
a("www.phishtank.com");
a("data.phishtank.com");

R = new RuleSet("Phoenix Media Group (partial)");
R.rules.push(new Rule("^http://(www\\.)?dealchicken\\.com/", "https://$1dealchicken.com/"));
a("dealchicken.com");
a("www.dealchicken.com");

R = new RuleSet("Phoronix Media (partial)");
R.rules.push(new Rule("^http://(www\\.)?openbenchmarking\\.org/", "https://openbenchmarking.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?phoromatic\\.com/", "https://phoromatic.com/"));
a("openbenchmarking.org");
a("www.openbenchmarking.org");
a("phoromatic.com");
a("www.phoromatic.com");

R = new RuleSet("Photonconsulting.com");
R.rules.push(new Rule("^http://(www\\.)?photonconsulting\\.com/", "https://www.photonconsulting.com/"));
a("photonconsulting.com");
a("www.photonconsulting.com");

R = new RuleSet("Picplz");
R.rules.push(new Rule("^http://(?:www\\.)?picplz\\.com/", "https://picplz.com/"));
a("picplz.com");
a("www.picplz.com");

R = new RuleSet("Pidgin (partial)");
R.rules.push(new Rule("^http://(www\\.)?pidgin\\.im/shared/", "https://developer.pidgin.im/shared/"));
R.rules.push(new Rule("^http://developer\\.pidgin\\.im/(chrome|extension|static|viewmtn)/", "https://developer.pidgin.im/$1/"));
a("pidgin.im");
a("developer.pidgin.im");
a("www.pidgin.im");

R = new RuleSet("Pinboard.in");
R.rules.push(new Rule("^http://(www\\.)?pinboard\\.in/", "https://pinboard.in/"));
a("www.pinboard.in");
a("pinboard.in");

R = new RuleSet("Ping.fm");
R.rules.push(new Rule("^http://(?:www\\.)?ping\\.fm/", "https://ping.fm/"));
a("ping.fm");
a("www.ping.fm");

R = new RuleSet("Pingdom (partial)");
R.rules.push(new Rule("^http://(pp\\.)?pingdom\\.com/", "https://$1pingdom.com/"));
R.rules.push(new Rule("^http://www\\.pingdom\\.com/(_css/|_img/|signup)", "https://www.pingdom.com/$1"));
R.exclusions.push(new Exclusion("^http://stats\\."));
a("pingdom.com");
a("*.pingdom.com");

R = new RuleSet("Pinterest");
R.rules.push(new Rule("^http://(assets\\.|www\\.)?pinterest\\.com/", "https://$1pinterest.com/"));
R.rules.push(new Rule("^http://(media(?:-cache\\d?)|passets(?:-cdn))\\.pinterest\\.com/", "https://s3.amazonaws.com/$1.pinterest.com/"));
a("pinterest.com");
a("*.pinterest.com");

R = new RuleSet("Pirate Party");
R.rules.push(new Rule("^http://(\\w+\\.)?junge-piraten\\.de/", "https://$1junge-piraten.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?partidopirata\\.es/", "https://www.partidopirata.es/"));
R.rules.push(new Rule("^http://(?:www\\.)?piraattipuolue\\.fi/", "https://www.piraattipuolue.fi/"));
R.rules.push(new Rule("^http://((forum|live|news|planet|wiki|www)\\.)?piratenpartei\\.de/", "https://$1piratenpartei.de/"));
R.rules.push(new Rule("^http://(www\\.)?piratenpartei-bayern\\.de/", "https://$1piratenpartei-bayern.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?(?:piratenpartij|remixdepolitiek)\\.nl/", "https://depiratenpartij.wordpress.com/"));
R.rules.push(new Rule("^http://tpb\\.piratenpartij\\.nl/", "https://tpb.piratenpartij.nl/"));
R.rules.push(new Rule("^http://(?:www\\.)?pirateparty\\.(ca|org\\.(au|uk))/", "https://www.pirateparty.$1/"));
R.exclusions.push(new Exclusion("^http://(flaschenpost|ober(bayern|pfalz))\\.piratenpartei\\.de/"));
R.exclusions.push(new Exclusion("^http://piratenpartei-bayern\\.de/$"));
a("junge-piraten.de");
a("*.junge-piraten.de");
a("partidopirata.es");
a("www.partidopirata.es");
a("piraattipuolue.fi");
a("www.piraattipuolue.fi");
a("piratenpartei.de");
a("*.piratenpartei.de");
a("piratenpartei-bayern.de");
a("*.piratenpartei-bayern.de");
a("piratenpartij.nl");
a("*.piratenpartij.nl");
a("pirateparty.ca");
a("www.pirateparty.ca");
a("pirateparty.org.au");
a("www.pirateparty.org.au");
a("pirateparty.org.uk");
a("www.pirateparty.org.uk");
a("remixdepolitiek.nl");
a("www.remixdepolitiek.nl");

R = new RuleSet("Piriform (partial)");
R.rules.push(new Rule("^http://static\\.piriform\\.com/", "https://s3.amazonaws.com/static.piriform.com/"));
a("static.piriform.com");

R = new RuleSet("Piscatus.se");
R.rules.push(new Rule("^http://www\\.piscatus\\.se/", "https://www.piscatus.se/"));
R.rules.push(new Rule("^http://piscatus\\.se/", "https://piscatus.se/"));
a("piscatus.se");
a("www.piscatus.se");

R = new RuleSet("Pivotal Tracker");
R.rules.push(new Rule("^http://(?:www\\.)?pivotaltracker\\.com/", "https://www.pivotaltracker.com/"));
a("pivotaltracker.com");
a("www.pivotaltracker.com");

R = new RuleSet("Pixi.me");
R.rules.push(new Rule("^http://pixi\\.me/", "https://pixi.me/"));
R.rules.push(new Rule("^http://www\\.pixi\\.me/", "https://www.pixi.me/"));
a("pixi.me");
a("www.pixi.me");

R = new RuleSet("Pizzahut UK");
R.rules.push(new Rule("^http://(?:www\\.)?pizzahut\\.co\\.uk/", "https://www.pizzahut.co.uk/"));
R.rules.push(new Rule("^http://(delivery)\\.pizzahut\\.co\\.uk/", "https://$1.pizzahut.co.uk/"));
a("pizzahut.co.uk");
a("www.pizzahut.co.uk");
a("delivery.pizzahut.co.uk");

R = new RuleSet("PlanetLab (partial)");
R.rules.push(new Rule("^http://(svn\\.|www\\.)?planet-lab\\.org/", "https://$1planet-lab.org/"));
a("planet-lab.org");
a("*.planet-lab.org");

R = new RuleSet("PlanetRomeo");
R.rules.push(new Rule("^http://(?:www\\.)?planetromeo\\.com/", "https://www.planetromeo.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?gayromeo\\.com/", "https://www.gayromeo.com/"));
a("www.planetromeo.com");
a("planetromeo.com");
a("www.gayromeo.com");
a("gayromeo.com");

R = new RuleSet("Planned Parenthood");
R.rules.push(new Rule("^((http://(?:www\\.)?)|https://)plannedparenthood\\.org/", "https://www.plannedparenthood.org/"));
a("plannedparenthood.org");
a("www.plannedparenthood.org");

R = new RuleSet("Playboy");
R.rules.push(new Rule("^http://(?:www\\.)?playboy\\.com/", "https://www.playboy.com/"));
a("playboy.com");
a("www.playboy.com");

R = new RuleSet("Pledgie");
R.rules.push(new Rule("^http://(?:www\\.)?pledgie\\.com/", "https://pledgie.com/"));
a("pledgie.com");
a("www.pledgie.com");

R = new RuleSet("PlentyOfFish");
R.rules.push(new Rule("^https?://(?:www\\.)?pof\\.com/", "https://www.pof.com/"));
a("pof.com");
a("www.pof.com");

R = new RuleSet("Pliktverket.se");
R.rules.push(new Rule("^http://www\\.pliktverket\\.se/", "https://www.pliktverket.se/"));
R.rules.push(new Rule("^http://pliktverket\\.se/", "https://pliktverket.se/"));
a("pliktverket.se");
a("www.pliktverket.se");

R = new RuleSet("Plone.org");
R.rules.push(new Rule("^http://www\\.plone\\.org/", "https://www.plone.org/"));
R.rules.push(new Rule("^http://plone\\.org/", "https://plone.org/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?plone\\.org/products"));
a("plone.org");
a("www.plone.org");

R = new RuleSet("Plus.net");
R.rules.push(new Rule("^http://(?:www\\.)?plus\\.net/", "https://www.plus.net/"));
R.rules.push(new Rule("^http://(portal|webmail|community)\\.plus\\.net/", "https://$1.plus.net/"));
a("plus.net");
a("www.plus.net");
a("portal.plus.net");
a("webmail.plus.net");
a("community.plus.net");

R = new RuleSet("Plusgirot.se");
R.rules.push(new Rule("^http://www\\.plusgirot\\.se/", "https://www.plusgirot.se/"));
R.rules.push(new Rule("^http://plusgirot\\.se/", "https://www.plusgirot.se/"));
a("plusgirot.se");
a("www.plusgirot.se");

R = new RuleSet("PodOmatic.com");
R.rules.push(new Rule("^http://enterprise\\.podomatic\\.com/", "https://enterprise.podomatic.com/"));
a("enterprise.podomatic.com");

R = new RuleSet("Pogo");
R.rules.push(new Rule("^http://(?:www\\.)?pogo\\.com/", "https://www.pogo.com/"));
R.rules.push(new Rule("^http://help\\.pogo\\.com/", "https://help.pogo.com/"));
R.rules.push(new Rule("^http://cdn\\.pogo\\.com/", "https://www.pogo.com/"));
R.exclusions.push(new Exclusion("http://www.pogo.com/avatar/edit.do"));
a("pogo.com");
a("*.pogo.com");

R = new RuleSet("Poivy.com");
R.rules.push(new Rule("^http://(?:www\\.)?poivy\\.com/", "https://www.poivy.com/"));
a("poivy.com");
a("www.poivy.com");

R = new RuleSet("PolarnoPyret.se");
R.rules.push(new Rule("^http://www\\.polarnopyret\\.se/", "https://www.polarnopyret.se/"));
R.rules.push(new Rule("^http://polarnopyret\\.se/", "https://www.polarnopyret.se/"));
a("polarnopyret.se");
a("www.polarnopyret.se");

R = new RuleSet("Poliisi.fi");
R.rules.push(new Rule("^http://(?:www\\.)?poliisi\\.fi/", "https://poliisi.fi/"));
a("poliisi.fi");
a("www.poliisi.fi");

R = new RuleSet("Polisforbundet.se");
R.rules.push(new Rule("^http://polisforbundet\\.se/", "https://www.polisforbundet.se/"));
R.rules.push(new Rule("^http://www\\.polisforbundet\\.se/", "https://www.polisforbundet.se/"));
a("polisforbundet.se");
a("www.polisforbundet.se");

R = new RuleSet("politisktinkorrekt.info");
R.rules.push(new Rule("^http://politisktinkorrekt\\.info/", "https://politisktinkorrekt.info/"));
R.rules.push(new Rule("^http://www\\.politisktinkorrekt\\.info/", "https://politisktinkorrekt.info/"));
a("politisktinkorrekt.info");

R = new RuleSet("Polk");
R.rules.push(new Rule("^http://(?:www\\.)?polk\\.com/", "https://www.polk.com/"));
a("polk.com");
a("www.polk.com");

R = new RuleSet("Polytechnic University of Catalonia (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?upc\\.(?:es|edu)/", "https://www.upc.edu/"));
R.rules.push(new Rule("^http://australis\\.upc\\.es/", "https://australis.upc.es/"));
R.rules.push(new Rule("^http://(\\w+\\.blog|peguera|tv)\\.upc\\.edu/", "https://$1.upc.edu/"));
a("upc.edu");
a("*.upc.edu");
a("*.blog.upc.edu");
a("upc.es");
a("*.upc.es");

R = new RuleSet("Poppy Sports");
R.rules.push(new Rule("^http://(?:www\\.)?poppysports\\.com/", "https://www.poppysports.com/"));
a("poppysports.com");
a("*.poppysports.com");
a("*.www.poppysports.com");

R = new RuleSet("Porteus Linux");
R.rules.push(new Rule("^http://(www\\.)?porteus\\.org/", "https://porteus.org/"));
a("porteus.org");
a("www.porteus.org");

R = new RuleSet("PositiveSSL");
R.rules.push(new Rule("^http://(?:www\\.)?positivessl\\.com/", "https://www.positivessl.com/"));
a("www.positivessl.com");
a("positivessl.com");

R = new RuleSet("Post-Click Marketing (partial)");
R.rules.push(new Rule("^http://ion\\.postclickmarketing\\.com/", "https://ion.postclickmarketing.com/"));
a("ion.postclickmarketing.com");

R = new RuleSet("Post.ch");
R.rules.push(new Rule("^http://(?:www\\.)?post\\.ch/", "https://www.post.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?posta\\.ch/", "https://www.posta.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?poste\\.ch/", "https://www.poste.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?swisspost\\.com/", "https://www.swisspost.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?tntswisspost\\.com/", "https://www.tntswisspost.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?swisspost\\.ch/", "https://www.swisspost.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?swisspost-gls\\.ch/", "https://www.swisspost-gls.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?swisspostbox\\.com/", "https://swisspostbox.com/"));
R.rules.push(new Rule("^http://(?:secure\\.)?swisspostbox\\.com/", "https://secure.swisspostbox.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?incamail\\.ch/", "https://www.incamail.ch/"));
R.rules.push(new Rule("^http://(?:im\\.)?post\\.ch/", "https://im.post.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?postauto\\.ch/", "https://www.postauto.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?postbus\\.ch/", "https://www.postbus.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?mypostbusiness\\.ch/", "https://www.mypostbusiness.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?postfinance\\.ch/", "https://www.postfinance.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?postsuisseid\\.ch/", "https://postsuisseid.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?swisssign\\.com/", "https://swisssign.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?press-shop\\.ch/", "https://www.press-shop.ch/"));
R.rules.push(new Rule("^http://(?:www\\.)?press-shop-deutschland\\.de/", "https://www.press-shop-deutschland.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?press-shop-france\\.fr/", "https://www.press-shop-france.fr/"));
R.rules.push(new Rule("^http://(?:www\\.)?press-shop-oesterreich\\.at/", "https://www.press-shop-oesterreich.at/"));
R.rules.push(new Rule("^http://(?:www\\.)?press-shop-international\\.com/", "https://www.press-shop-international.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?mds-media\\.ch/", "https://www.mds-media.ch/"));
R.rules.push(new Rule("^http://(?:admin\\.)?omgpm\\.com/", "https://admin.omgpm.com/"));
a("post.ch");
a("www.post.ch");
a("posta.ch");
a("www.posta.ch");
a("poste.ch");
a("www.poste.ch");
a("swisspost.com");
a("www.swisspost.com");
a("tntswisspost.com");
a("www.tntswisspost.com");
a("swisspost.ch");
a("www.swisspost.ch");
a("swisspost-gls.ch");
a("www.swisspost-gls.ch");
a("swisspostbox.com");
a("www.swisspostbox.com");
a("secure.swisspostbox.com");
a("incamail.ch");
a("www.incamail.ch");
a("im.post.ch");
a("postauto.ch");
a("www.postauto.ch");
a("postbus.ch");
a("mypostbusiness.ch");
a("www.mypostbusiness.ch");
a("postfinance.ch");
a("www.postfinance.ch");
a("postsuisseid.ch");
a("www.postsuisseid.ch");
a("swisssign.com");
a("www.swisssign.com");
a("press-shop.ch");
a("www.press-shop.ch");
a("press-shop-deutschland.de");
a("www.press-shop-deutschland.de");
a("press-shop-france.fr");
a("www.press-shop-france.fr");
a("press-shop-oesterreich.at");
a("www.press-shop-oesterreich.at");
a("press-shop-international.com");
a("www.press-shop-international.com");
a("mds-media.ch");
a("www.mds-media.ch");
a("admin.omgpm.com");

R = new RuleSet("Postbank");
R.rules.push(new Rule("^http://(?:www\\.)?postbank\\.de/", "https://www.postbank.de/"));
a("postbank.de");
a("www.postbank.de");

R = new RuleSet("Postdanmark.dk");
R.rules.push(new Rule("^http://(www\\.)?postdanmark\\.dk/", "https://www.postdanmark.dk/"));
a("postdanmark.dk");
a("www.postdanmark.dk");

R = new RuleSet("Poste.it");
R.rules.push(new Rule("^http://(?:www\\.)?poste\\.it/", "https://www.poste.it/"));
a("poste.it");
a("www.poste.it");

R = new RuleSet("Posten.se");
R.rules.push(new Rule("^http://posten\\.se/", "https://www.posten.se/"));
R.rules.push(new Rule("^http://www\\.posten\\.se/", "https://www.posten.se/"));
a("posten.se");
a("www.posten.se");

R = new RuleSet("Posterous");
R.rules.push(new Rule("^http://(?:www\\.)?posterous\\.com/", "https://posterous.com/"));
R.rules.push(new Rule("^http://([^@:\\./]+)\\.posterous\\.com/", "https://$1.posterous.com/"));
R.rules.push(new Rule("^http://files\\.posterous\\.com/", "https://s3.amazonaws.com/files.posterous.com/"));
a("posterous.com");
a("*.posterous.com");

R = new RuleSet("PostgreSQL");
R.rules.push(new Rule("^http://(?:www\\.)?postgresql\\.eu/", "https://www.postgresql.eu/"));
R.rules.push(new Rule("^https?://postgresql\\.org/", "https://www.postgresql.org/"));
R.rules.push(new Rule("^http://www\\.postgresql\\.org/(account|media)/", "https://www.postgresql.org/$1/"));
R.rules.push(new Rule("^http://(commitfest|nagios|planet|redmine|wiki)\\.postgresql\\.org/", "https://$1.postgresql.org/"));
R.rules.push(new Rule("^http://(www\\.)?postgresql\\.us/", "https://$1postgresql.us/"));
a("postgresql.eu");
a("www.postgresql.eu");
a("postgresql.org");
a("commitfest.postgresql.org");
a("nagios.postgresql.org");
a("planet.postgresql.org");
a("redmine.postgresql.org");
a("wiki.postgresql.org");
a("www.postgresql.org");
a("postgresql.us");
a("*.postgresql.us");

R = new RuleSet("PowNed (partial)");
R.rules.push(new Rule("^http://registratie\\.powned\\.tv/", "https://registratie.powned.tv/"));
a("registratie.powned.tv");

R = new RuleSet("Powells.com");
R.rules.push(new Rule("^http://(?:www\\.)?powells\\.com/", "https://www.powells.com/"));
R.rules.push(new Rule("^http://content-[0-9]\\.powells\\.com/", "https://www.powells.com/"));
a("powells.com");
a("www.powells.com");

R = new RuleSet("Powernotebooks.com");
R.rules.push(new Rule("^http://(?:www\\.)?powernotebooks\\.com/", "https://www.powernotebooks.com/"));
a("powernotebooks.com");
a("www.powernotebooks.com");

R = new RuleSet("PrecisionPros.com (partial)");
R.rules.push(new Rule("^http://(ssl\\.|www\\.)?precisionpros\\.com/", "https://$1precisionpros.com/"));
a("precisionpros.com");
a("www.precisionpros.com");

R = new RuleSet("Pressflex (partial)");
R.rules.push(new Rule("^http://web\\.blogads\\.com/", "https://web.blogads.com/"));
a("web.blogads.com");

R = new RuleSet("Pretty in Cash (partial)");
R.rules.push(new Rule("^http://exgf\\.teenbff\\.com/", "https://exgf.teenbff.com/"));
a("exgf.teenbff.com");

R = new RuleSet("Pretty Lights Music");
R.rules.push(new Rule("^http://(www\\.)?prettylightsmusic\\.com/", "https://prettylightsmusic.com/"));
a("prettylightsmusic.com");
a("www.prettylightsmusic.com");

R = new RuleSet("Previa.se");
R.rules.push(new Rule("^http://(?:www\\.)?previa\\.se/", "https://www.previa.se/"));
a("previa.se");
a("www.previa.se");

R = new RuleSet("PreyProject");
R.rules.push(new Rule("^http://(control|panel)\\.preyproject\\.com/", "https://$1.preyproject.com/"));
a("control.preyproject.com");
a("panel.preyproject.com");

R = new RuleSet("Priberam.pt");
R.rules.push(new Rule("^http://(?:www\\.)?priberam\\.pt/", "https://www.priberam.pt/"));
a("priberam.pt");
a("www.priberam.pt");

R = new RuleSet("PriceGrabber (partial)");
R.rules.push(new Rule("^http://(?:i\\.pgcdn|ai\\.pricegrabber)\\.com/", "https://images.pricegrabber.com/"));
R.rules.push(new Rule("^http://pricegrabber\\.com/", "https://www.pricegrabber.com/"));
R.rules.push(new Rule("^http://ah\\.pricegrabber\\·com/", "https://www.pricegrabber.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?pricegrabber\\.com/pgr_adcall\\.php", "https://www.pricegrabber.com/pgr_adcall.php"));
R.rules.push(new Rule("^http://(images|partner)\\.pricegrabber\\.com/", "https://$1.pricegrabber.com/"));
a("i.pgcdn.com");
a("pricegrabber.com");
a("*.pricegrabber.com");

R = new RuleSet("Princeton.edu");
R.rules.push(new Rule("^http://www\\.princeton\\.edu/", "https://www.princeton.edu/"));
R.rules.push(new Rule("^http://princeton\\.edu/", "https://www.princeton.edu/"));
a("princeton.edu");
a("www.princeton.edu");

R = new RuleSet("PrintFriendly (partial)");
R.rules.push(new Rule("^http://cdn\\.printfriendly\\.org/", "https://s3.amazonaws.com/printnicer/"));
a("cdn.printfriendly.org");

R = new RuleSet("Privacy International");
R.rules.push(new Rule("^http://(www\\.)?privacyinternational\\.org/", "https://$1privacyinternational.org/"));
a("privacyinternational.org");
a("www.privacyinternational.org");

R = new RuleSet("PrivacyBox");
R.rules.push(new Rule("^http://(?:www\\.)?privacybox\\.de/", "https://privacybox.de/"));
a("privacybox.de");
a("www.privacybox.de");

R = new RuleSet("Privacy Rights Clearinghouse");
R.rules.push(new Rule("^http://(?:www\\.)?privacyrights\\.org/", "https://www.privacyrights.org/"));
a("privacyrights.org");
a("www.privacyrights.org");

R = new RuleSet("PrivatVPN");
R.rules.push(new Rule("^http://(?:www\\.)privatevpn\\.com/", "https://www.privatevpn.com/"));
a("privatevpn.com");
a("www.privatevpn.com");

R = new RuleSet("PrivatePaste");
R.rules.push(new Rule("^http://([a-zA-Z0-9-]+\\.)?privatepaste\\.com/", "https://$1privatepaste.com/"));
a("privatepaste.com");
a("*.privatepaste.com");

R = new RuleSet("PrivateWifi");
R.rules.push(new Rule("^http://(?:www\\.)?privatewifi\\.com/", "https://www.privatewifi.com/"));
a("privatewifi.com");
a("www.privatewifi.com");

R = new RuleSet("ProPublica.org");
R.rules.push(new Rule("^http://(?:www\\.)?propublica\\.(:?net|org)/", "https://www.propublica.org/"));
R.rules.push(new Rule("^http://projects\\.propublica\\.org/", "https://projects.propublica.org/"));
R.rules.push(new Rule("^http://cdn\\.propublica\\.net/", "https://s3.amazonaws.com/cdn.propublica.net/"));
a("propublica.net");
a("*.propublica.net");
a("propublica.org");
a("*.propublica.org");

R = new RuleSet("Procter & Gamble (partial)");
R.rules.push(new Rule("^http://(www\\.)?brandsaver\\.ca/", "https://$1brandsaver.ca/"));
R.rules.push(new Rule("^http://(www\\.)?(oralb|pg)\\.com/", "https://$1$2.com/"));
R.rules.push(new Rule("^http://news\\.pg\\.com/sites/", "https://pg.newshq.businesswire.com/sites/"));
R.rules.push(new Rule("^http://(www\\.)?pgbrandsampler\\.ca/", "https://$1pgbrandsampler.ca/"));
R.rules.push(new Rule("^http://(?:media\\.)?pgeveryday(\\.ca|solutions\\.com)/", "https://www.pgeveryday$1/"));
R.rules.push(new Rule("^http://www\\.pgeverydaysolutions\\.com/(content/|pgeds/(en_US/data_root/|(register-eds|sign-in)\\.jsp))", "https://www.pgeverydaysolutions.com/$1"));
R.rules.push(new Rule("^http://www\\.pgeveryday\\.ca/(css/|images/|(log-in|register)\\.jsp|spacer\\.gif)", "https://www.pgeveryday.ca/$1"));
a("brandsaver.ca");
a("www.brandsaver.ca");
a("oralb.com");
a("www.oralb.com");
a("pg.com");
a("*.pg.com");
a("pgbrandsampler.ca");
a("www.pgbrandsampler.ca");
a("pgeveryday.ca");
a("*.pgeveryday.ca");
a("pgeverydaysolutions.com");
a("*.pgeverydaysolutions.com");

R = new RuleSet("Project Euler");
R.rules.push(new Rule("^http://(www\\.)?projecteuler\\.net/", "https://projecteuler.net/"));
a("www.projecteuler.net");
a("projecteuler.net");

R = new RuleSet("ProjectHoneypot");
R.rules.push(new Rule("^http://(?:www\\.)?projecthoneypot\\.org/", "https://www.projecthoneypot.org/"));
a("projecthoneypot.org");
a("www.projecthoneypot.org");

R = new RuleSet("Project Syndicate");
R.rules.push(new Rule("^http://(www\\.)?project-syndicate\\.org/", "https://www.project-syndicate.org/"));
a("www.project-syndicate.org");
a("project-syndicate.org");

R = new RuleSet("Prolexic");
R.rules.push(new Rule("^http://(\\w+\\.)prolexic\\.com/", "https://$1prolexic.com/"));
a("prolexic.com");
a("*.prolexic.com");

R = new RuleSet("Prometric");
R.rules.push(new Rule("^http://(?:www\\.)?prometric\\.com/", "https://www.prometric.com/"));
a("prometric.com");
a("www.prometric.com");

R = new RuleSet("Provantage");
R.rules.push(new Rule("^http://(?:www\\.)?provantage\\.com/", "https://www.provantage.com/"));
a("provantage.com");
a("*.provantage.com");

R = new RuleSet("Provide Support (partial)");
R.rules.push(new Rule("^http://((admin2|image|messenger2)\\.)?providesupport\\.com/", "https://$1providesupport.com/"));
R.rules.push(new Rule("^http://(www\\.)?providesupport\\.com/s/", "https://$1providesupport.com/s/"));
a("providesupport.com");
a("*.providesupport.com");

R = new RuleSet("Proxify");
R.rules.push(new Rule("^http://(www\\.)?proxify\\.com/", "https://$1proxify.com/"));
a("proxify.com");
a("www.proxify.com");

R = new RuleSet("Proxy.org (partial)");
R.rules.push(new Rule("^http://(www\\.)?proxy\\.org/", "https://$1proxy.org/"));
R.exclusions.push(new Exclusion("^http://proxy\\.org/forum/"));
a("proxy.org");
a("*.proxy.org");

R = new RuleSet("Ptpimg.me");
R.rules.push(new Rule("^http://(www\\.)?ptpimg\\.me/", "https://ptpimg.me/"));
a("*.ptpimg.me");
a("ptpimg.me");

R = new RuleSet("PubSoft.org");
R.rules.push(new Rule("^http://(www\\.)?pubsoft\\.org/", "https://www.pubsoft.org/"));
a("pubsoft.org");
a("www.pubsoft.org");

R = new RuleSet("Public Broadcasting Service (partial)");
R.rules.push(new Rule("^http://video\\.pbs\\.org/", "https://video.pbs.org/"));
R.rules.push(new Rule("^http://www-tc\\.pbs\\.org/s3/pbs\\.(merlin\\.cdn\\.prod|pbsorg-prod\\.mediafiles|videoportal-prod\\.cdn)/", "https://s3.amazonaws.com/pbs.$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?shoppbs\\.org/", "https://www.shoppbs.org/"));
a("video.pbs.org");
a("www-tc.pbs.org");
a("shoppbs.org");
a("www.shoppbs.org");

R = new RuleSet("Public.Resource.Org");
R.rules.push(new Rule("^http://(www\\.)?(public\\.)?resource\\.org/", "https://public.resource.org/"));
R.rules.push(new Rule("^http://(www\\.)?(house|law|patent)\\.resource\\.org/", "https://$2.resource.org/"));
R.rules.push(new Rule("^http://(www\\.)?yeswecan\\.org/", "https://yeswecan.org/"));
a("resource.org");
a("www.resource.org");
a("house.resource.org");
a("www.house.resource.org");
a("law.resource.org");
a("www.law.resource.org");
a("patent.resource.org");
a("www.patent.resource.org");
a("public.resource.org");
a("www.public.resource.org");
a("yeswescan.org");
a("www.yeswescan.org");

R = new RuleSet("Public Citizen");
R.rules.push(new Rule("^http://(?:www\\.)?citizen\\.org/", "https://www.citizen.org/"));
R.rules.push(new Rule("^http://action\\.citizen\\.org/", "https://action.citizen.org/"));
a("citizen.org");
a("www.citizen.org");
a("action.citizen.org");

R = new RuleSet("Publicintelligence");
R.rules.push(new Rule("^http://(www\\.)?publicintelligence\\.net/", "https://publicintelligence.net/"));
a("publicintelligence.net");
a("www.publicintelligence.net");

R = new RuleSet("Puma.com");
R.rules.push(new Rule("^http://www\\.puma\\.com/", "https://www.puma.com/"));
R.rules.push(new Rule("^http://puma\\.com/", "https://www.puma.com/"));
R.rules.push(new Rule("^http://assets\\.puma\\.com/", "https://assets.puma.com/"));
R.rules.push(new Rule("^http://is\\.puma\\.com/", "https://is.puma.com/"));
a("www.puma.com");
a("assets.puma.com");
a("is.puma.com");
a("puma.com");

R = new RuleSet("Pure Auto (partial)");
R.rules.push(new Rule("^http://(www\\.)?purecars\\.com/", "https://$1purecars.com/"));
a("purecars.com");
a("www.purecars.com");

R = new RuleSet("PureHacking");
R.rules.push(new Rule("^http://(?:www\\.)?purehacking\\.com/", "https://www.purehacking.com/"));
a("www.purehacking.com");
a("purehacking.com");

R = new RuleSet("Puritan.com");
R.rules.push(new Rule("^http://(?:www\\.)?puritan\\.com/", "https://www.puritan.com/"));
a("puritan.com");
a("www.puritan.com");

R = new RuleSet("QIP");
R.rules.push(new Rule("^http://(?:www\\.)?qip\\.ru/", "https://qip.ru/"));
a("qip.ru");
a("*.qip.ru");

R = new RuleSet("Qualcomm (partial)");
R.rules.push(new Rule("^http://(www\\.)?qca\\.qualcomm\\.com/", "https://$1qca.qualcomm.com/"));
a("qca.qualcomm.com");
a("www.qca.qualcomm.com");

R = new RuleSet("Qualtrics (surveys)");
R.rules.push(new Rule("^http://([\\w\\-]+)\\.((us2|asia)\\.)?qualtrics\\.com/", "https://$1.$2qualtrics.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?qualtrics\\.com/"));
a("*.qualtrics.com");
a("*.us2.qualtrics.com");
a("*.asia.qualtrics.com");

R = new RuleSet("Qualys (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?qualys\\.com/", "https://$1qualys.com/"));
R.exclusions.push(new Exclusion("^http://news\\."));
a("qualys.com");
a("*.qualys.com");

R = new RuleSet("Quantcast");
R.rules.push(new Rule("^http://(ak\\.|www\\.)?quantcast\\.com/", "https://$1quantcast.com/"));
R.rules.push(new Rule("^http://quantserve\\.com/", "https://quantserve.com/"));
R.rules.push(new Rule("^http://www\\.quantserve\\.com/", "https://quantserve.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.quantserve\\.com/", "https://$1.quantserve.com/"));
R.rules.push(new Rule("^http://edge\\.quantserve\\.com/", "https://www.quantserve.com/"));
a("quantcast.com");
a("*.quantcast.com");
a("quantserve.com");
a("*.quantserve.com");

R = new RuleSet("Qweery (partial)");
R.rules.push(new Rule("^http://box\\.qweery\\.nl/", "https://box.qweery.nl/"));
a("box.qweery.nl");

R = new RuleSet("Qxl");
R.rules.push(new Rule("^http://(?:www\\.)?qxl\\.no/", "https://www.qxl.no/"));
R.rules.push(new Rule("^http://(?:www\\.)?qxl\\.dk/", "https://www.qxl.dk/"));
a("qxl.no");
a("www.qxl.no");
a("qxl.dk");
a("www.qxl.dk");

R = new RuleSet("RAC");
R.rules.push(new Rule("^http://(?:www\\.)?rac\\.co\\.uk/", "https://www.rac.co.uk/"));
a("rac.co.uk");
a("www.rac.co.uk");

R = new RuleSet("Reformed Church");
R.rules.push(new Rule("^http://(?:www\\.)?rca\\.org/", "https://www.rca.org/"));
a("rca.org");
a("www.rca.org");

R = new RuleSet("RFC-Editor");
R.rules.push(new Rule("^http://(?:www\\.)?rfc-editor\\.org/", "https://www.rfc-editor.org/"));
a("rfc-editor.org");
a("www.rfc-editor.org");

R = new RuleSet("RIAA");
R.rules.push(new Rule("^http://(www\\.)?riaa\\.com/", "https://$1riaa.com/"));
a("riaa.com");
a("www.riaa.com");

R = new RuleSet("RIS");
R.rules.push(new Rule("^http://(www\\.)?ris\\.bka\\.gv\\.at/", "https://www.ris.bka.gv.at/"));
a("www.ris.bka.gv.at");
a("ris.bka.gv.at");

R = new RuleSet("RISI");
R.rules.push(new Rule("^http://(www\\.)?risi(?:info)?\\.com/", "https://$1risiinfo.com/"));
a("risi.com");
a("www.risi.com");
a("risiinfo.com");
a("www.risiinfo.com");

R = new RuleSet("ROBOXchange");
R.rules.push(new Rule("^http://(?:www\\.)?roboxchange\\.com/", "https://roboxchange.com/"));
a("roboxchange.com");
a("www.roboxchange.com");

R = new RuleSet("RSA");
R.rules.push(new Rule("^http://(?:www\\.)?rsa\\.com/", "https://www.rsa.com/"));
a("rsa.com");
a("www.rsa.com");

R = new RuleSet("RSPCA (partial)");
R.rules.push(new Rule("^http://rspca\\.org\\.uk/", "https://www.rspca.org.uk/"));
R.rules.push(new Rule("^http://(donations|(?:content\\.)?www)\\.rspca\\.org\\.uk/", "https://$1.rspca.org.uk/"));
R.rules.push(new Rule("^http://(www\\.)?rspcashop\\.co\\.uk/", "https://$1rspcashop.co.uk/"));
R.exclusions.push(new Exclusion("^http://www\\.rspca\\.org\\.uk/(home)?$"));
a("rspca.org.uk");
a("donations.rspca.org.uk");
a("gifts.rspca.org.uk");
a("*.gifts.rspca.org.uk");
a("www.rspca.org.uk");
a("content.www.rspca.org.uk");
a("rspcashop.co.uk");
a("*.rspcashop.co.uk");

R = new RuleSet("RSVP");
R.rules.push(new Rule("^https?://(?:images\\.|resources\\.)?rsvp\\.com\\.au/", "https://www.rsvp.com.au/"));
R.rules.push(new Rule("^http://www\\.rsvp\\.com\\.au/((cms-|member)media/|css/|favicon\\.ico|images/|login\\.action|registration/)", "https://www.rsvp.com.au/$1"));
a("rsvp.com.au");
a("*.rsvp.com.au");

R = new RuleSet("RT.com");
R.rules.push(new Rule("^http://(?:www\\.)?rt\\.com/", "https://rt.com/"));
a("rt.com");
a("www.rt.com");

R = new RuleSet("RT.ru");
R.rules.push(new Rule("^http://rt\\.ru/", "https://rt.ru/"));
R.rules.push(new Rule("^http://www\\.rt\\.ru/", "https://www.rt.ru/"));
a("rt.ru");
a("www.rt.ru");

R = new RuleSet("Rabobank");
R.rules.push(new Rule("^http://(?:www\\.)?rabobank\\.nl/", "https://www.rabobank.nl/"));
R.rules.push(new Rule("^http://bankieren\\.rabobank\\.nl/", "https://bankieren.rabobank.nl/"));
a("www.rabobank.nl");
a("rabobank.nl");
a("bankieren.rabobank.nl");

R = new RuleSet("Rackerhacker");
R.rules.push(new Rule("^http://(www\\.)?rackerhacker\\.com/", "https://rackerhacker.com/"));
a("rackerhacker.com");
a("www.rackerhacker.com");

R = new RuleSet("Rackspace (partial)");
R.rules.push(new Rule("^http://([\\w\\-]+)\\.(?:r\\d\\d?|ssl)\\.cf([12])\\.rackcdn\\.com/", "https://$1.ssl.cf$2.rackcdn.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?rackspace(cloud)?\\.(com|co\\.(uk|za)|dk|n[lo]|se)/", "https://www.rackspace$1.$2/"));
R.rules.push(new Rule("^http://(apps|cart|cp|my)\\.rackspace\\.com/", "https://$1.rackspace.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?rackspace(?:\\.com)?\\.hk/", "https://www.rackspace.hk/"));
R.rules.push(new Rule("^http://(lon\\.)?manage\\.rackspacecloud\\.com/", "https://$1manage.rackspacecloud.com/"));
R.exclusions.push(new Exclusion("^http://www\\.rackspace\\.com/cloud/"));
a("*.r73.cf1.rackcdn.com");
a("*.r29.cf2.rackcdn.com");
a("*.r30.cf2.rackcdn.com");
a("*.r56.cf2.rackcdn.com");
a("*.r62.cf2.rackcdn.com");
a("*.r77.cf2.rackcdn.com");
a("*.r78.cf2.rackcdn.com");
a("*.r85.cf2.rackcdn.com");
a("*.r99.cf2.rackcdn.com");
a("*.ssl.cf2.rackcdn.com");
a("rackspace.com");
a("*.rackspace.com");
a("rackspace.com.hk");
a("www.rackspace.com.hk");
a("rackspace.co.uk");
a("*.rackspace.co.uk");
a("rackspace.co.za");
a("*.rackspace.co.za");
a("rackspace.dk");
a("*.rackspace.dk");
a("rackspace.hk");
a("*.rackspace.hk");
a("rackspace.nl");
a("*.rackspace.nl");
a("rackspace.no");
a("*.rackspace.no");
a("rackspace.se");
a("*.rackspace.se");
a("rackspacecloud.com");
a("manage.rackspacecloud.com");
a("lon.manage.rackspacecloud.com");
a("www.rackspacecloud.com");

R = new RuleSet("radian.org");
R.rules.push(new Rule("^http://(www\\.)?radian\\.org/", "https://radian.org/"));
a("radian.org");

R = new RuleSet("Raiffeisen.ch");
R.rules.push(new Rule("^http://(?:www\\.)?raiffeisen\\.ch/", "https://www.raiffeisen.ch/"));
R.rules.push(new Rule("^http://(?:tb\\.)?raiffeisendirect\\.ch/", "https://tb.raiffeisendirect.ch/"));
a("raiffeisen.ch");
a("www.raiffeisen.ch");
a("tb.raiffeisendirect.ch");

R = new RuleSet("Rambler (partial)");
R.rules.push(new Rule("^http://(id?|images|kassa|mail)\\.rambler\\.ru/", "https://$1.rambler.ru/"));
a("i.rambler.ru");
a("id.rambler.ru");
a("images.rambler.ru");
a("kassa.rambler.ru");
a("mail.rambler.ru");

R = new RuleSet("Rapid7 (partial)");
R.rules.push(new Rule("^http://(dev|mail)\\.metasploit\\.com/", "https://$1.metasploit.com/"));
R.rules.push(new Rule("^http://(www\\.)?rapid7\\.com/", "https://www.rapid7.com/"));
R.rules.push(new Rule("^http://community\\.rapid7\\.com/", "https://community.rapid7.com/"));
a("dev.metasploit.com");
a("mail.metasploit.com");
a("rapid7.com");
a("community.rapid7.com");
a("www.rapid7.com");

R = new RuleSet("RapidSSL");
R.rules.push(new Rule("^http://(?:www\\.)?rapidssl\\.com/", "https://www.rapidssl.com/"));
a("rapidssl.com");
a("www.rapidssl.com");

R = new RuleSet("RatePoint (partial)");
R.rules.push(new Rule("^http://(my|reviews|sitetools|subscribe)\\.ratepoint\\.com/", "https://$1.ratepoint.com/"));
R.rules.push(new Rule("^http://(www\\.)?ratepoint\\.com/(profile/|(login($|\\?))|map/|seereviews/)", "https://ratepoint.com/$2"));
a("ratepoint.com");
a("my.ratepoint.com");
a("reviews.ratepoint.com");
a("sitetools.ratepoint.com");
a("subscribe.ratepoint.com");
a("www.ratepoint.com");

R = new RuleSet("Raymond.CC");
R.rules.push(new Rule("^http://(cdn\\.|www\\.)?raymond\\.cc/", "https://$1raymond.cc/"));
a("raymond.cc");
a("*.raymond.cc");

R = new RuleSet("ReadItLaterList.com");
R.rules.push(new Rule("^http://(?:www\\.)?readitlaterlist\\.com/", "https://readitlaterlist.com/"));
a("readitlaterlist.com");
a("www.readitlaterlist.com");

R = new RuleSet("ReadSpeaker");
R.rules.push(new Rule("^http://(?:www\\.)?readspeaker\\.com/", "https://www.readspeaker.com/"));
R.rules.push(new Rule("^http://(app|media|vttts|lqttswr|docreader)\\.readspeaker\\.com/", "https://$1.readspeaker.com/"));
R.rules.push(new Rule("^http://asp\\.readspeaker\\.net/", "https://asp.readspeaker.net/"));
a("readspeaker.com");
a("www.readspeaker.com");
a("app.readspeaker.com");
a("media.readspeaker.com");
a("vttts.readspeaker.com");
a("lqttswr.readspeaker.com");
a("docreader.readspeaker.com");
a("asp.readspeaker.net");

R = new RuleSet("Reco.se");
R.rules.push(new Rule("^http://www\\.reco\\.se/", "https://www.reco.se/"));
R.rules.push(new Rule("^http://reco\\.se/", "https://www.reco.se/"));
a("reco.se");
a("www.reco.se");

R = new RuleSet("Record Store Day");
R.rules.push(new Rule("^http://(?:www\\.)?recordstoreday(?:\\.tuneportals)\\.com/", "https://recordstoreday.tuneportals.com/"));
a("recordstoreday.com");
a("www.recordstoreday.com");
a("recordstoreday.tuneportals.com");

R = new RuleSet("Recurly.com");
R.rules.push(new Rule("^http://app\\.recurly\\.com/", "https://app.recurly.com/"));
R.rules.push(new Rule("^http://api\\.recurly\\.com/", "https://api.recurly.com/"));
a("app.recurly.com");
a("api.recurly.com");

R = new RuleSet("Recycle Now");
R.rules.push(new Rule("^http://(www\\.)?recyclenow\\.com/", "https://www.recyclenow.com/"));
a("recyclenow.com");
a("www.recyclenow.com");

R = new RuleSet("Red-Pill.eu (partial)");
R.rules.push(new Rule("^http://(www\\.)?red-pill\\.eu/(admin|mail)/", "https://$1red-pill.eu/$1/"));
a("red-pill.eu");
a("www.red-pill.eu");

R = new RuleSet("RedHat");
R.rules.push(new Rule("^http://(?:www\\.)?redhat\\.com/", "https://www.redhat.com/"));
R.rules.push(new Rule("^http://(access|archive|bugzilla|careers|docs|openshift)\\.redhat\\.com/", "https://$1.redhat.com/"));
a("redhat.com");
a("*.redhat.com");
a("*.smtrcs.redhat.com");

R = new RuleSet("RedIRIS.es");
R.rules.push(new Rule("^http://(www\\.)?rediris\\.es/", "https://www.rediris.es/"));
a("www.rediris.es");
a("rediris.es");

R = new RuleSet("Redbox.com");
R.rules.push(new Rule("^http://(?:www\\.)?redbox\\.com/", "https://www.redbox.com/"));
R.rules.push(new Rule("^http://images\\.redbox\\.com/", "https://images.redbox.com/"));
a("redbox.com");
a("www.redbox.com");
a("images.redbox.com");

R = new RuleSet("Reddit");
R.rules.push(new Rule("^http://ssl\\.reddit\\.com/", "https://ssl.reddit.com/"));
R.rules.push(new Rule("^http://static\\.reddit\\.com/", "https://s3.amazonaws.com/static.reddit.com/"));
R.rules.push(new Rule("^http://thumbs\\.reddit\\.com/", "https://s3.amazonaws.com/thumbs.reddit.com/"));
R.rules.push(new Rule("^http://(\\w+\\.)?thumbs\\.redditmedia\\.com/", "https://s3.amazonaws.com/$1thumbs.redditmedia.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?redditstatic\\.com/", "https://s3.amazonaws.com/redditstatic/"));
a("ssl.reddit.com");
a("static.reddit.com");
a("thumbs.reddit.com");
a("thumbs.redditmedia.com");
a("*.thumbs.redditmedia.com");
a("redditstatic.com");
a("www.redditstatic.com");

R = new RuleSet("Reed Exhibitions (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?infosecurity-magazine\\.com/", "https://www.infosecurity-magazine.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?lexisnexis\\.com/", "https://www.lexisnexis.com/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?infosecurity-magazine\\.com/(.+/$|download/\\d{1,5})"));
a("infosecurity-magazine.com");
a("www.infosecurity-magazine.com");
a("lexisnexis.com");
a("www.lexisnexis.com");

R = new RuleSet("Register.com");
R.rules.push(new Rule("^(http://(www\\.)?|https://)register\\.com/", "https://www.register.com/"));
R.rules.push(new Rule("^http://(help|support|webmail0[12])\\.register\\.com/", "https://$1.register.com/"));
a("register.com");
a("help.register.com");
a("support.register.com");
a("webmail01.register.com");
a("webmail02.register.com");
a("www.register.com");

R = new RuleSet("Reichelt.de");
R.rules.push(new Rule("^http://(www\\.|such001\\.|secure\\.)?reichelt\\.de/", "https://secure.reichelt.de/"));
a("www.reichelt.de");
a("reichelt.de");
a("secure.reichelt.de");
a("such001.reichelt.de");

R = new RuleSet("Rejseplanen.dk");
R.rules.push(new Rule("^http://rejseplanen\\.dk/", "https://www.rejseplanen.dk/"));
R.rules.push(new Rule("^http://(www|info|xajax-prod|euspirit|ptt)\\.rejseplanen\\.dk/", "https://$1.rejseplanen.dk/"));
a("rejseplanen.dk");
a("*.rejseplanen.dk");

R = new RuleSet("RememberTheMilk");
R.rules.push(new Rule("^http://(?:www\\.)?rememberthemilk\\.com/", "https://www.rememberthemilk.com/"));
a("rememberthemilk.com");
a("www.rememberthemilk.com");

R = new RuleSet("Reputation.com");
R.rules.push(new Rule("^http://reputation\\.com/", "https://www.reputation.com/"));
R.rules.push(new Rule("^http://www\\.reputation\\.com/([\\w\\-/]*images|min|secure)/", "https://www.reputation.com/$1/"));
R.rules.push(new Rule("^http://t\\.reputation\\.com/", "https://t.reputation.com/"));
a("reputation.com");
a("t.reputation.com");
a("www.reputation.com");

R = new RuleSet("Resurs.se");
R.rules.push(new Rule("^http://(?:www\\.)?resurs\\.se/", "https://www.resurs.se/"));
a("resurs.se");
a("www.resurs.se");

R = new RuleSet("Revsci.net");
R.rules.push(new Rule("^http://(ads|js|pix04)\\.revsci\\.net/", "https://$1.revsci.net/"));
a("*.revsci.net");

R = new RuleSet("RezTrip");
R.rules.push(new Rule("^http://(?:www\\.)?reztrip\\.com/", "https://www.reztrip.com/"));
a("reztrip.com");
a("www.reztrip.com");

R = new RuleSet("Rhino Software (partial)");
R.rules.push(new Rule("^http://(www\\.)?rhinosoft\\.com/", "https://$1rhinosoft.com/"));
a("rhinosoft.com");
a("www.rhinosoft.com");

R = new RuleSet("Ricardo.ch");
R.rules.push(new Rule("^http://(?:www\\.)?ricardo\\.ch/", "https://www.ricardo.ch/"));
a("ricardo.ch");
a("www.ricardo.ch");

R = new RuleSet("Ricoh (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?ricoh\\.co\\.in/", "https://ricoh.co.in/"));
R.rules.push(new Rule("^http://(?:www\\.)?ricoh\\.com/", "https://www.ricoh.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?ricoh\\.com\\.hk/co(mmon|tent)/", "https://www.ricoh.com.hk/co$1/"));
R.rules.push(new Rule("^http://marketplace\\.ricoh\\.com\\.sg/", "https://marketplace.ricoh.com.sg/"));
R.rules.push(new Rule("^http://(?:www\\.)?ricoh\\.sg/", "https://www.ricoh.sg/"));
a("ricoh.co.in");
a("www.ricoh.co.in");
a("ricoh.com");
a("www.ricoh.com");
a("ricoh.com.hk");
a("www.ricoh.com.hk");
a("marketplace.ricoh.com.sg");
a("ricoh.sg");
a("www.ricoh.sg");

R = new RuleSet("Riga");
R.rules.push(new Rule("^http://riga\\.lv/", "https://riga.lv/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.riga\\.lv/", "https://$1.riga.lv/"));
R.rules.push(new Rule("^http://eriga\\.lv/", "https://eriga.lv/"));
R.rules.push(new Rule("^http://www\\.eriga\\.lv/", "https://www.eriga.lv/"));
a("riga.lv");
a("*.riga.lv");
a("eriga.lv");
a("www.eriga.lv");

R = new RuleSet("RightNow Technologies (partial)");
R.rules.push(new Rule("^http://([\\w\\-]+)\\.custhelp\\.com/", "https://$1.custhelp.com/"));
a("*.custhelp.com");

R = new RuleSet("Riksgalden.se");
R.rules.push(new Rule("^http://riksgalden\\.se/", "https://www.riksgalden.se/"));
R.rules.push(new Rule("^http://www\\.riksgalden\\.se/", "https://www.riksgalden.se/"));
a("riksgalden.se");
a("www.riksgalden.se");

R = new RuleSet("ripe.net");
R.rules.push(new Rule("^http://ripe\\.net/", "https://ripe.net/"));
R.rules.push(new Rule("^http://www\\.ripe\\.net/", "https://www.ripe.net/"));
a("ripe.net");
a("www.ripe.net");

R = new RuleSet("Riseup");
R.rules.push(new Rule("^http://([^/:@\\.]+\\.)?riseup\\.net/", "https://$1riseup.net/"));
a("riseup.net");
a("*.riseup.net");

R = new RuleSet("Riviera Tours");
R.rules.push(new Rule("^http://(www\\.)?rivieratours\\.com/", "https://$1rivieratours.com/"));
a("rivieratours.com");
a("www.rivieratours.com");

R = new RuleSet("RoadRunner");
R.rules.push(new Rule("^http://(?:www\\.)?rr\\.com/", "https://www.rr.com/"));
R.rules.push(new Rule("^http://hercules\\.rr\\.com/", "https://hercules.rr.com/"));
a("rr.com");
a("www.rr.com");
a("hercules.rr.com");

R = new RuleSet("Robeco");
R.rules.push(new Rule("^http://(?:www\\.)?robeco\\.nl/", "https://www.robeco.nl/"));
a("www.robeco.nl");
a("robeco.nl");

R = new RuleSet("RoboHash");
R.rules.push(new Rule("^http://(\\w+\\.)?robohash\\.org/", "https://$1robohash.org/"));
a("robohash.org");
a("*.robohash.org");

R = new RuleSet("University of Rochester");
R.rules.push(new Rule("^http://(www\\.)?rochester\\.edu/", "https://rochester.edu/"));
a("www.rochester.edu");
a("rochester.edu");

R = new RuleSet("Roiservice.com");
R.rules.push(new Rule("^http://track\\.roiservice\\.com/", "https://track.roiservice.com/"));
a("track.roiservice.com");

R = new RuleSet("romab.com");
R.rules.push(new Rule("^http://www\\.romab\\.com/", "https://www.romab.com/"));
R.rules.push(new Rule("^http://www\\.romab\\.se/", "https://www.romab.com/"));
R.rules.push(new Rule("^http://romab\\.se/", "https://romab.com/"));
R.rules.push(new Rule("^http://romab\\.com/", "https://romab.com/"));
a("romab.com");
a("romab.se");
a("www.romab.com");
a("www.romab.se");

R = new RuleSet("Rottentomatoes");
R.rules.push(new Rule("^http://(www\\.)?rottentomatoes\\.com/", "https://www.rottentomatoes.com/"));
a("www.rottentomatoes.com");
a("rottentomatoes.com");

R = new RuleSet("Royal Astronomical Society");
R.rules.push(new Rule("^http://(?:www\\.)?ras\\.org\\.uk/", "https://www.ras.org.uk/"));
a("ras.org.uk");
a("www.ras.org.uk");

R = new RuleSet("Royal Institution of Great Britain (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?rigb\\.org/", "https://www.rigb.org/"));
a("rigb.org");
a("www.rigb.org");

R = new RuleSet("Royal Society of Chemistry (partial)");
R.rules.push(new Rule("^http://([\\w-]+\\.)?chemspider\\.com/", "https://$1chemspider.com/"));
R.rules.push(new Rule("^http://(?:rsc|(www\\.)?rscweb)\\.org/", "https://www.rsc.org/"));
R.rules.push(new Rule("^http://(carousel|members)\\.rsc\\.org/", "https://$1.rsc.org/"));
a("chemspider.com");
a("*.chemspider.com");
a("rsc.org");
a("carousel.rsc.org");
a("rscweb.org");
a("www.rscweb.org");

R = new RuleSet("RoyalGovUK");
R.rules.push(new Rule("^http://(?:www\\.)?royal\\.gov\\.uk/", "https://www.royal.gov.uk/"));
a("royal.gov.uk");
a("www.royal.gov.uk");

R = new RuleSet("Rubicon Project (partial)");
R.rules.push(new Rule("^http://(login|optimized-by|revv-static)\\.rubiconproject\\.com/", "https://$1.rubiconproject.com/"));
a("login.rubiconproject.com");
a("optimized-by.rubiconproject.com");
a("revv-static.rubiconproject.com");

R = new RuleSet("RubyGems.org");
R.rules.push(new Rule("^http://(?:www\\.)?rubygems\\.org/", "https://rubygems.org/"));
a("rubygems.org");

R = new RuleSet("redmine.ruby-lang.org");
R.rules.push(new Rule("^http://redmine\\.ruby-lang\\.org/", "https://redmine.ruby-lang.org/"));
a("redmine.ruby-lang.org");

R = new RuleSet("Rutgers");
R.rules.push(new Rule("^http://(?:www\\.)?rutgers\\.edu/", "https://www.rutgers.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?(acs|cs|eden|nbcs|physics|rci)\\.rutgers\\.edu/", "https://www.$1.rutgers.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?(comminfo|food|gobble|math|njaes|rhshope|ruinfo|ruoffcampus|search|studentabc|uhr|ur)\\.rutgers\\.edu/", "https://$1.rutgers.edu/"));
R.rules.push(new Rule("^http://(parktran|rudots)\\.rutgers\\.edu/", "https://gobble.rutgers.edu/"));
a("rutgers.edu");
a("*.rutgers.edu");
a("www.*.rutgers.edu");

R = new RuleSet("Ryanair.com");
R.rules.push(new Rule("^http://www\\.ryanair\\.com/", "https://www.ryanair.com/"));
R.rules.push(new Rule("^http://ryanair\\.com/", "https://www.ryanair.com/"));
a("www.ryanair.com");
a("ryanair.com");

R = new RuleSet("S2 Games (partial)");
R.rules.push(new Rule("^http://(www\\.)?heroesofnewerth\\.com/", "https://$1heroesofnewerth.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?savage2\\.com/", "https://savage2.com/"));
a("heroesofnewerth.com");
a("www.heroesofnewerth.com");
a("savage2.com");
a("www.savage2.com");

R = new RuleSet("SACNAS (partial)");
R.rules.push(new Rule("^http://(www\\.)?sacnas\\.org/($|civicrm/|content/|member-directory|sites/|user/)", "https://$1sacnas.org/$2"));
a("sacnas.org");
a("www.sacnas.org");

R = new RuleSet("SAMBA");
R.rules.push(new Rule("^http://samba\\.com/", "https://www.samba.com/"));
R.rules.push(new Rule("^http://(sambacapital|sambatdwl|sambaonline|www)\\.samba\\.com/", "https://$1.samba.com/"));
a("samba.com");
a("*.samba.com");

R = new RuleSet("SANS");
R.rules.push(new Rule("^http://isc\\.sans\\.org/", "https://isc.sans.org/"));
R.rules.push(new Rule("^http://isc\\.sans\\.edu/", "https://isc.sans.edu/"));
R.rules.push(new Rule("^http://www\\.sans\\.org/", "https://www.sans.org/"));
R.rules.push(new Rule("^http://sans\\.org/", "https://sans.org/"));
a("isc.sans.edu");
a("isc.sans.org");
a("sans.org");
a("www.sans.org");

R = new RuleSet("SB Nation (partial)");
R.rules.push(new Rule("^http://(www\\.)?sbnation\\.com/", "https://$1sbnation.com/"));
a("sbnation.com");
a("www.sbnation.com");

R = new RuleSet("SBB.ch");
R.rules.push(new Rule("^http://(?:www\\.)?sbb\\.ch/", "https://www.sbb.ch/"));
R.rules.push(new Rule("^http://mct\\.sbb\\.ch/", "https://mct.sbb.ch/"));
R.rules.push(new Rule("^http://mcts\\.sbb\\.ch/", "https://mcts.sbb.ch/"));
R.rules.push(new Rule("^http://smsalarm\\.sbb\\.ch/", "https://smsalarm.sbb.ch/"));
a("sbb.ch");
a("*.sbb.ch");

R = new RuleSet("StateBankOfIndia");
R.rules.push(new Rule("^http://(?:www\\.)?sbi\\.co\\.in/", "https://www.sbi.co.in/"));
a("sbi.co.in");
a("www.sbi.co.in");

R = new RuleSet("SF.se");
R.rules.push(new Rule("^http://sf\\.se/", "https://www.sf.se/"));
R.rules.push(new Rule("^http://www\\.sf\\.se/", "https://www.sf.se/"));
a("sf.se");
a("www.sf.se");

R = new RuleSet("SFM Group (partial)");
R.rules.push(new Rule("^http://sfm-offshore\\.com/", "https://www.sfm-offshore.com/"));
R.rules.push(new Rule("^http://(de|es|fr|it|www)\\.sfm-offshore\\.com/(favicon\\.ico|(imag|modul|templat)es/|order/|(bestellengesellschaft|(ordina|solicitud)societaoffshore|commandersociete|ordercompany)\\.html)", "https://$1.sfm-offshore.com/$2"));
a("sfm-offshore.com");
a("*.sfm-offshore.com");

R = new RuleSet("SGSStudentbostader.se");
R.rules.push(new Rule("^http://(www\\.)?sgsstudentbostader\\.se/", "https://www.sgsstudentbostader.se/"));
a("sgsstudentbostader.se");
a("www.sgsstudentbostader.se");

R = new RuleSet("SH.se");
R.rules.push(new Rule("^http://bibl\\.sh\\.se/", "https://bibl.sh.se/"));
R.rules.push(new Rule("^http://webappl\\.web\\.sh\\.se/", "https://webappl.web.sh.se/"));
a("webappl.web.sh.se");
a("bibl.sh.se");

R = new RuleSet("SI.se");
R.rules.push(new Rule("^http://www\\.si\\.se/", "https://www.si.se/"));
R.rules.push(new Rule("^http://si\\.se/", "https://www.si.se/"));
a("si.se");
a("www.si.se");

R = new RuleSet("SICS.se");
R.rules.push(new Rule("^http://sics\\.se/", "https://www.sics.se/"));
R.rules.push(new Rule("^http://www\\.sics\\.se/", "https://www.sics.se/"));
a("sics.se");
a("www.sics.se");

R = new RuleSet("SJ.se");
R.rules.push(new Rule("^http://sj\\.se/", "https://www.sj.se/"));
R.rules.push(new Rule("^http://www\\.sj\\.se/", "https://www.sj.se/"));
a("sj.se");
a("*.sj.se");

R = new RuleSet("SL.se");
R.rules.push(new Rule("^http://sl\\.se/", "https://sl.se/"));
R.rules.push(new Rule("^http://www\\.sl\\.se/", "https://sl.se/"));
a("sl.se");

R = new RuleSet("SLF.se");
R.rules.push(new Rule("^http://slf\\.se/", "https://www.slf.se/"));
R.rules.push(new Rule("^http://www\\.slf\\.se/", "https://www.slf.se/"));
a("slf.se");
a("www.slf.se");

R = new RuleSet("SLI Systems (partial)");
R.rules.push(new Rule("^http://assets\\.(resultspage|slisystems)\\.com/", "https://assets.$1.com/"));
a("assets.resultspage.com");
a("assets.slisystems.com");

R = new RuleSet("SLU.se");
R.rules.push(new Rule("^http://slu\\.se/", "https://www.slu.se/"));
R.rules.push(new Rule("^http://www\\.slu\\.se/", "https://www.slu.se/"));
R.rules.push(new Rule("^http://internt\\.slu\\.se/", "https://internet.slu.se/"));
a("www.slu.se");
a("slu.se");
a("internt.slu.se");

R = new RuleSet("SNS Bank");
R.rules.push(new Rule("^http://(?:www\\.)?snsbank\\.nl/", "https://www.snsbank.nl/"));
a("www.snsbank.nl");
a("snsbank.nl");

R = new RuleSet("SPCA Los Angeles");
R.rules.push(new Rule("^http://(?:www\\.)?spcala\\.com/", "https://spcala.com/"));
R.rules.push(new Rule("^https://www\\.spcala\\.com/", "https://spcala.com/"));
a("spcala.com");
a("www.spcala.com");

R = new RuleSet("SQLite");
R.rules.push(new Rule("^http://((?:www\\.)?sqlite\\.org)/", "https://$1/"));
a("sqlite.org");
a("www.sqlite.org");

R = new RuleSet("SSAFA (partial)");
R.rules.push(new Rule("^http://(www\\.)?ssafastore\\.co\\.uk/", "https://$1ssafastore.co.uk/"));
a("ssafastore.co.uk");
a("www.ssafastore.co.uk");

R = new RuleSet("SSLlabs.com");
R.rules.push(new Rule("^http://(?:www\\.)?ssllabs\\.com/", "https://www.ssllabs.com/"));
a("ssllabs.com");
a("www.ssllabs.com");

R = new RuleSet("SSLshopper");
R.rules.push(new Rule("^http://(?:www\\.)?sslshopper\\.com/", "https://www.sslshopper.com/"));
a("www.sslshopper.com");
a("sslshopper.com");

R = new RuleSet("ST.org");
R.rules.push(new Rule("^http://st\\.org/", "https://www.st.org/"));
R.rules.push(new Rule("^http://www\\.st\\.org/", "https://www.st.org/"));
a("st.org");
a("www.st.org");

R = new RuleSet("SVGOpen");
R.rules.push(new Rule("^http://(?:www\\.)?svgopen\\.org/", "https://www.svgopen.org/"));
a("svgopen.org");
a("www.svgopen.org");

R = new RuleSet("SVT.se");
R.rules.push(new Rule("^http://svt\\.se/", "https://svt.se/"));
R.rules.push(new Rule("^http://www\\.svt\\.se/", "https://svt.se/"));
a("svt.se");

R = new RuleSet("Sabnzbd Forum");
R.rules.push(new Rule("^http://forums\\.sabnzbd\\.org/", "https://forums.sabnzbd.org/"));
a("forums.sabnzbd.org");

R = new RuleSet("Sac.se");
R.rules.push(new Rule("^http://(?:www\\.)?sac\\.se/", "https://www.sac.se/"));
a("sac.se");
a("www.sac.se");

R = new RuleSet("Safari Books Online");
R.rules.push(new Rule("^http://my\\.safaribooksonline\\.com/login$", "https://ssl.safaribooksonline.com/securelogin"));
R.rules.push(new Rule("^http://www\\.safaribooksonline\\.com/Corporate/Index/logIn\\.php$", "https://ssl.safaribooksonline.com/securelogin"));
a("my.safaribooksonline.com");
a("www.safaribooksonline.com");

R = new RuleSet("Safe-mail.net");
R.rules.push(new Rule("^http://safe-mail\\.net/", "https://www.safe-mail.net/"));
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.safe-mail\\.net/", "https://$1.safe-mail.net/"));
a("safe-mail.net");
a("*.safe-mail.net");

R = new RuleSet("Sage (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?sagepay\\.com/(misc/|(modul|sit)es/)", "https://www.sagepay.com/$1"));
R.rules.push(new Rule("^http://(customerservices|live|support|test)\\.sagepay\\.com/", "https://$1.sagepay.com/"));
a("sagepay.com");
a("*.sagepay.com");

R = new RuleSet("Sagernotebook.com");
R.rules.push(new Rule("^http://(?:www\\.)?sagernotebook\\.com/", "https://www.sagernotebook.com/"));
a("sagernotebook.com");
a("www.sagernotebook.com");

R = new RuleSet("Sailthru (partial)");
R.rules.push(new Rule("^http://([^b]\\w*\\.)?sailthru\\.com/", "https://$1sailthru.com/"));
R.rules.push(new Rule("^http://blog\\.sailthru\\.com/wp-content/", "https://blog.sailthru.com/wp-content/"));
R.exclusions.push(new Exclusion("^http://getstarted\\."));
a("sailthru.com");
a("*.sailthru.com");

R = new RuleSet("Salesforce.com (partial)");
R.rules.push(new Rule("^http://webassets\\.assistly\\.com/", "https://assistlywebsite.s3.amazonaws.com/"));
R.rules.push(new Rule("^http://desk\\.com/", "https://www.desk.com/"));
R.rules.push(new Rule("^http://(dev|reg|support|www)\\.desk\\.com/", "https://$1.desk.com/"));
R.rules.push(new Rule("^http://assets\\d\\.desk\\.com/", "https://s3.amazonaws.com/deskcontent/"));
R.rules.push(new Rule("^http://webassets\\.desk\\.com/", "https://s3.amazonaws.com/deskwww/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.secure\\.force\\.com/", "https://$1.secure.force.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?(sales)?force\\.com/", "https://www.$1force.com/"));
R.rules.push(new Rule("^http://login\\.salesforce\\.com/", "https://login.salesforce.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?salesforce\\.com/(assets|common)/", "https://secure2.sfdcstatic.com/$1/"));
R.rules.push(new Rule("^http://(?:secure|www)2\\.sfdcstatic\\.com/", "https://secure2.sfdcstatic.com/"));
a("webassets.assistly.com");
a("desk.com");
a("*.desk.com");
a("force.com");
a("www.force.com");
a("*.secure.force.com");
a("salesforce.com");
a("*.salesforce.com");
a("secure2.sfdcstatic.com");

R = new RuleSet("Salsa Labs");
R.rules.push(new Rule("^http://(?:www\\.)?salsalabs\\.com/", "https://www.salsalabs.com/"));
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.salsalabs\\.com/", "https://$1.salsalabs.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?salsacommons\\.org/", "https://www.salsacommons.org/"));
a("salsalabs.com");
a("*.salsalabs.com");
a("salsacommons.org");
a("www.salsacommons.org");

R = new RuleSet("SamKnows (partial)");
R.rules.push(new Rule("^http://(www\\.)?samknows\\.eu/", "https://www.samknows.eu/"));
a("samknows.eu");
a("www.samknows.eu");

R = new RuleSet("Samba.org");
R.rules.push(new Rule("^http://samba\\.org/", "https://samba.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.samba\\.org/", "https://$1.samba.org/"));
R.exclusions.push(new Exclusion("^http://jcifs\\.samba\\.org/"));
a("samba.org");
a("*.samba.org");

R = new RuleSet("Sanalmarket");
R.rules.push(new Rule("^http://(www\\.)?sanalmarket\\.com\\.tr/kweb/", "https://www.sanalmarket.com.tr/kweb/"));
a("www.sanalmarket.com.tr");
a("sanalmarket.com.tr");

R = new RuleSet("Sanitarium.se");
R.rules.push(new Rule("^http://sanitarium\\.se/", "https://sanitarium.se/"));
R.rules.push(new Rule("^http://www\\.sanitarium\\.se/", "https://sanitarium.se/"));
a("sanitarium.se");
a("www.sanitarium.se");

R = new RuleSet("Santander.co.uk");
R.rules.push(new Rule("^http://(www\\.)?santander\\.co\\.uk/", "https://www.santander.co.uk/"));
a("www.santander.co.uk");
a("santander.co.uk");

R = new RuleSet("Sapo.pt");
R.rules.push(new Rule("^http://login\\.sapo\\.pt/", "https://login.sapo.pt/"));
a("login.sapo.pt");

R = new RuleSet("Say Media (partial)");
R.rules.push(new Rule("^http://(www\\.)?saymedia\\.com/", "https://$1saymedia.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?typepad\\.com/", "https://www.typepad.com/"));
R.exclusions.push(new Exclusion("http://www\\.typepad\\.com/services/signin/"));
a("saymedia.com");
a("www.saymedia.com");
a("typepad.com");
a("www.typepad.com");

R = new RuleSet("Sberbank of Russia");
R.rules.push(new Rule("^http://(www\\.)?sbrf\\.ru/", "https://www.sbrf.ru/"));
a("sbrf.ru");
a("www.sbrf.ru");

R = new RuleSet("ScMagazineUS.com");
R.rules.push(new Rule("^http://www\\.scmagazineus\\.com/", "https://www.scmagazineus.com/"));
R.rules.push(new Rule("^http://scmagazineus\\.com/", "https://www.scmagazineus.com/"));
a("scmagazineus.com");
a("www.scmagazineus.com");

R = new RuleSet("Nectarine Demoscene Music");
R.rules.push(new Rule("^http://(www\\.)?scenemusic\\.net/", "https://www.scenemusic.net/"));
a("www.scenemusic.net");
a("scenemusic.net");

R = new RuleSet("Scepsis");
R.rules.push(new Rule("^http://(www\\.)?scepsis\\.ru/", "https://scepsis.ru/"));
a("www.scepsis.ru");
a("scepsis.ru");

R = new RuleSet("Schneider Kreuznach (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?schneideroptics\\.com/", "https://www.schneideroptics.com/"));
a("schneideroptics.com");
a("www.schneideroptics.com");

R = new RuleSet("Schneier on Security");
R.rules.push(new Rule("^http://(?:www\\.)?schneier\\.com/", "https://www.schneier.com/"));
a("schneier.com");
a("www.schneier.com");

R = new RuleSet("SchooltoPrison.org");
R.rules.push(new Rule("^http://(?:www\\.)?schooltoprison\\.org/", "https://www.schooltoprison.org/"));
a("schooltoprison.org");
a("www.schooltoprison.org");

R = new RuleSet("ScienceDaily.com");
R.rules.push(new Rule("^http://(www\\.)?sciencedaily\\.com/", "https://www.sciencedaily.com/"));
R.rules.push(new Rule("^http://images\\.sciencedaily\\.com/", "https://www.sciencedaily.com/images/"));
a("sciencedaily.com");
a("images.sciencedaily.com");
a("www.sciencedaily.com");

R = new RuleSet("Sciencemag.org");
R.rules.push(new Rule("^http://(?:www\\.)?sciencemag\\.org/", "https://www.sciencemag.org/"));
a("sciencemag.org");
a("www.sciencemag.org");

R = new RuleSet("Scientific American (partial)");
R.rules.push(new Rule("^http://(www\\.)?sciamdigital\\.com/(ax/|(cover)?images/|index\\.cfm\\?fa=Account\\.ViewLogin)/", "https://$1sciamdigital.com/$2/"));
R.rules.push(new Rule("^http://(subscribe\\.|www\\.)?scientificamerican\\.com/", "https://$1scientificamerican.com/"));
a("sciamdigital.com");
a("www.sciamdigital.com");
a("scientificamerican.com");
a("*.scientificamerican.com");

R = new RuleSet("Scientificlinux.org");
R.rules.push(new Rule("^http://(www\\.)?scientificlinux\\.org/", "https://www.scientificlinux.org/"));
a("scientificlinux.org");
a("www.scientificlinux.org");

R = new RuleSet("Scintilla.utwente.nl");
R.rules.push(new Rule("^http://www\\.scintilla\\.utwente\\.nl/", "https://www.scintilla.utwente.nl/"));
a("www.scintilla.utwente.nl");
a("scintilla.utwente.nl");

R = new RuleSet("Scopus");
R.rules.push(new Rule("^http://(www\\.)?scopus\\.com/", "https://www.scopus.com/"));
a("scopus.com");
a("www.scopus.com");

R = new RuleSet("Scottevest");
R.rules.push(new Rule("^http://scottevest\\.com/", "https://scottevest.com/"));
R.rules.push(new Rule("^http://www\\.scottevest\\.com/", "https://www.scottevest.com/"));
a("scottevest.com");
a("www.scottevest.com");

R = new RuleSet("scounter.rambler.ru");
R.rules.push(new Rule("^http://counter\\.rambler\\.ru/", "https://scounter.rambler.ru/"));
a("counter.rambler.ru");

R = new RuleSet("Screen It! Movie Reviews");
R.rules.push(new Rule("^http://(?:www\\.)?screenit\\.com/", "https://www.screenit.com/"));
a("screenit.com");
a("www.screenit.com");

R = new RuleSet("Seagate.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?seagate\\.com/", "https://origin-www.seagate.com/www/en-us/"));
R.rules.push(new Rule("^http://(origin-www|partnerreg|reseller|spp|sso)\\.seagate\\.com/", "https://$1.seagate.com/"));
a("seagate.com");
a("www.seagate.com");
a("origin-www.seagate.com");
a("partnerreg.seagate.com");
a("reseller.seagate.com");
a("spp.seagate.com");
a("sso.seagate.com");

R = new RuleSet("Secular Coalition for America");
R.rules.push(new Rule("^http://(www\\.)?secular\\.org/", "https://secular.org/"));
a("www.secular.org");
a("secular.org");

R = new RuleSet("Secunia");
R.rules.push(new Rule("^http://(?:www\\.)?secunia\\.com/", "https://secunia.com/"));
a("secunia.com");
a("www.secunia.com");

R = new RuleSet("SecureList");
R.rules.push(new Rule("^http://(?:www\\.)?securelist\\.com/", "https://www.securelist.com/"));
a("securelist.com");
a("www.securelist.com");

R = new RuleSet("securepaths.com");
R.rules.push(new Rule("^http://(www\\.)?securepaths\\.com/", "https://$1securepaths.com/"));
a("securepaths.com");
a("www.securepaths.com");

R = new RuleSet("Securepaynet.net");
R.rules.push(new Rule("^https?://securepaynet\\.net/", "https://www.securepaynet.net/"));
R.rules.push(new Rule("^http://(\\w+)\\.securepaynet\\.net/", "https://$1.securepaynet.net/"));
R.rules.push(new Rule("^http://img(\\d)\\.wsimg\\.com/", "https://img$1.wsimg.com/"));
a("securepaynet.net");
a("*.securepaynet.net");
a("*.wsimg.com");

R = new RuleSet("Secureserver.net (partial)");
R.rules.push(new Rule("^http://(cloud|email|hostingmanager|hxcc|images|login|mobilemail|products|p3nmssqladmin|p3smysqladmin01|www)\\.secureserver\\.net/", "https://$1.secureserver.net/"));
a("*.secureserver.net");

R = new RuleSet("Security In A Box");
R.rules.push(new Rule("^http://security\\.ngoinabox\\.org/", "https://security.ngoinabox.org/"));
a("security.ngoinabox.org");

R = new RuleSet("SecurityMetrics");
R.rules.push(new Rule("^http://(www\\.)?securitymetrics\\.com/", "https://$1securitymetrics.com/"));
R.rules.push(new Rule("^http://blog\\.securitymetrics\\.com/favicon\\.ico", "https://www.blogger.com/favicon.ico"));
a("securitymetrics.com");
a("blog.securitymetrics.com");
a("www.securitymetrics.com");

R = new RuleSet("Security.NL");
R.rules.push(new Rule("^http://(?:www\\.)?security\\.nl/", "https://secure.security.nl/"));
a("security.nl");
a("www.security.nl");

R = new RuleSet("SecurityWeek.com");
R.rules.push(new Rule("^http://(www\\.)?securityweek\\.com/", "https://www.securityweek.com/"));
a("securityweek.com");
a("*.securityweek.com");

R = new RuleSet("Securosis");
R.rules.push(new Rule("^http://www\\.securosis\\.com/", "https://securosis.com/"));
R.rules.push(new Rule("^http://securosis\\.com/", "https://securosis.com/"));
a("securosis.com");
a("www.securosis.com");

R = new RuleSet("Sedo.com");
R.rules.push(new Rule("^http://(?:www\\.)?affili\\.net/", "https://www.affili.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?affili\\.de/", "https://www.affili.net/de/"));
R.rules.push(new Rule("^http://(?:www\\.)?sedo\\.(co(m|\\.uk)|de)/", "https://sedo.$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?sedo\\.fr/", "https://sedo.com/fr/home/bienvenue"));
R.rules.push(new Rule("^http://(backoffice|cvs|dbe|techoffice)\\.sedo\\.de/", "https://$1.sedo.de/"));
R.rules.push(new Rule("^http://img\\.sedoparking\\.com/", "https://sedo.cachefly.net/"));
a("affili.net");
a("www.affili.net");
a("sedo.com");
a("*.sedo.com");
a("sedo.co.uk");
a("*.sedo.co.uk");
a("sedo.de");
a("*.sedo.de");
a("sedo.fr");
a("www.sedo.fr");
a("backoffice.sedo.de");
a("cvs.sedo.de");
a("dbe.sedo.de");
a("techoffice.sedo.de");
a("img.sedoparking.com");

R = new RuleSet("See Group (partial)");
R.rules.push(new Rule("^http://seetickets\\.com/", "https://www.seetickets.com/"));
R.rules.push(new Rule("^http://www\\.seetickets\\.com/(Content/(About-us|Data-Protection|Security)|Skins/|CustomerService|Terms-and-Conditions)", "https://www.seetickets.com/$1"));
R.rules.push(new Rule("^http://www2\\.seetickets\\.com/", "https://www2.seetickets.com/"));
R.rules.push(new Rule("^http://s(?:tatic\\.)?\\.s(?:eetickets|tstat)\\.com/", "https://static.seetickets.com/"));
a("seetickets.com");
a("static.seetickets.com");
a("www.seetickets.com");
a("www2.seetickets.com");
a("s.ststat.com");

R = new RuleSet("SegPay (partial)");
R.rules.push(new Rule("^http://my\\.segpay\\.com/", "https://my.segpay.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?segpayc(hat|s)\\.com/", "https://segpayc$1.com/"));
a("my.segpay.com");
a("segpaycs.com");
a("www.segpaycs.com");
a("segpaychat.com");
a("www.segpaychat.com");

R = new RuleSet("Sehirfirsati");
R.rules.push(new Rule("^http://(www\\.)?sehirfirsati\\.com/", "https://www.sehirfirsati.com/"));
R.rules.push(new Rule("^http://static\\.tr\\.groupon-content\\.net/", "https://static.sehirfirsati.com/"));
a("static.sehirfirsati.com");
a("www.sehirfirsati.com");
a("sehirfirsati.com");
a("static.tr.groupon-content.net");

R = new RuleSet("Sellaband.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?sellaband\\.com/", "https://$1sellaband.com/"));
R.rules.push(new Rule("^http://(alternative|electronic|hiphop|pop|rnb|rock|world)\\.sellaband\\.com/", "https://$1.sellaband.com/"));
R.rules.push(new Rule("^http://support\\.sellaband\\.com/(access|generated|images|registration|system)", "https://sellaband.zendesk.com/$1"));
a("sellaband.com");
a("*.sellaband.com");

R = new RuleSet("Senate.gov");
R.rules.push(new Rule("^http://(sopr\\.|www\\.)?senate\\.gov/", "https://$1senate.gov/"));
a("senate.gov");
a("*.senate.gov");

R = new RuleSet("Sendmail");
R.rules.push(new Rule("^http://(?:www\\.)?sendmail\\.com/", "https://www.sendmail.com/"));
a("sendmail.com");
a("www.sendmail.com");

R = new RuleSet("Serialist");
R.rules.push(new Rule("^http://(?:www\\.)?serialist\\.net/", "https://serialist.net/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.serialist\\.net/", "https://$1.serialist.net/"));
a("serialist.net");
a("*.serialist.net");

R = new RuleSet("Shannon Health");
R.rules.push(new Rule("^(http://(www\\.)?|https://)shannonhealth\\.com/", "https://www.shannonhealth.com/"));
R.rules.push(new Rule("^(http://(www\\.)?|https://)myshannonconnection\\.org/", "https://www.myshannonconnection.org/"));
a("shannonhealth.com");
a("www.shannonhealth.com");
a("myshannonconnection.org");
a("www.myshannonconnection.org");

R = new RuleSet("ShareThis (embedded widget)");
R.rules.push(new Rule("^http://w\\.sharethis\\.com/", "https://ws.sharethis.com/"));
a("w.sharethis.com");

R = new RuleSet("Sheet Music Plus (partial)");
R.rules.push(new Rule("^http://sheetmusicplus\\.com/", "https://www.sheetmusicplus.com/"));
R.rules.push(new Rule("^http://www\\.sheetmusicplus\\.com/(account/orders|affiliates|cart/save_item|checkout|easyrebates|favicon\\.ico|newsletter/signup|sign_(in|up))", "https://www.sheetmusicplus.com/$1"));
R.rules.push(new Rule("^http://assets\\.sheetmusicplus\\.com/", "https://d29ci68ykuu27r.cloudfront.net/"));
a("sheetmusicplus.com");
a("*.sheetmusicplus.com");

R = new RuleSet("Shopify (partial)");
R.rules.push(new Rule("^http://shopify\\.com/", "https://www.shopify.com/"));
R.rules.push(new Rule("^http://(apps|cdn|checkout|static|themes|www)\\.shopify\\.com/", "https://$1.shopify.com/"));
R.rules.push(new Rule("^http://cdn\\.apps\\.shopify\\.com/", "https://apps.shopify.com/"));
a("shopify.com");
a("cdn.shopify.com");
a("themes.shopify.com");
a("www.shopify.com");

R = new RuleSet("Shopzilla (partial)");
R.rules.push(new Rule("^http://bizrate\\.com/", "https://www.bizrate.com/"));
R.rules.push(new Rule("^http://((images|medals|www)\\.)?bizrate\\.com/", "https://$1bizrate.com/"));
R.rules.push(new Rule("^http://shopzilla\\.com/", "https://www.shopzilla.com/"));
R.rules.push(new Rule("^http://(merchant\\.|www\\.)?shopzilla\\.com/", "https://$1shopzilla.com/"));
a("bizrate.com");
a("*.bizrate.com");
a("shopzilla.com");
a("*.shopzilla.com");

R = new RuleSet("Shoutback Concepts (partial)");
R.rules.push(new Rule("^http://static\\.shoutback\\.com/", "https://static.shoutback.com/"));
a("static.shoutback.com");

R = new RuleSet("Showcase-TV");
R.rules.push(new Rule("^http://click-finder\\.jp/", "https://click-finder.jp/"));
R.rules.push(new Rule("^http://hadalog\\.jp/", "https://hadalog.jp/"));
R.rules.push(new Rule("^http://(www\\.)?hoku\\.co\\.jp/", "https://$1hoku.co.jp/"));
R.rules.push(new Rule("^http://(www\\.)?navicast\\.co\\.jp/", "https://$1navicast.co.jp/"));
R.rules.push(new Rule("^http://(www\\.)?showcase-tv\\.com/", "https://$1showcase-tv.com/"));
R.rules.push(new Rule("^http://click\\.showcase-tv\\.jp/", "https://click.showcase-tv.jp/"));
a("click-finder.jp");
a("hadalog.jp");
a("hoku.co.jp");
a("www.hoku.co.jp");
a("navicast.co.jp");
a("www.navicast.co.jp");
a("showcase-tv.com");
a("www.showcase-tv.com");
a("click.showcase-tv.jp");

R = new RuleSet("ShrinkTheWeb");
R.rules.push(new Rule("^http://(?:www\\.)?shrinktheweb\\.com/", "https://www.shrinktheweb.com/"));
R.rules.push(new Rule("^http://www\\.shrinktheweb\\.com/blog$", "https://www.shrinktheweb.com/blogs/"));
R.rules.push(new Rule("^http://images\\.shrinktheweb\\.com/", "https://images.shrinktheweb.com/"));
R.rules.push(new Rule("^https?://learn\\.shrinktheweb\\.com/", "https://www.shrinktheweb.com/learn/index.html"));
a("shrinktheweb.com");
a("*.shrinktheweb.com");
a("*.images.shrinktheweb.com");

R = new RuleSet("Siemens.com");
R.rules.push(new Rule("^http://siemens\\.com/", "https://www.siemens.com/"));
R.rules.push(new Rule("^http://www\\.siemens\\.com/", "https://www.siemens.com/"));
a("siemens.com");
a("www.siemens.com");

R = new RuleSet("Siggraph.org");
R.rules.push(new Rule("^http://(?:www\\.)?siggraph\\.org/", "https://www.siggraph.org/"));
a("siggraph.org");
a("www.siggraph.org");

R = new RuleSet("SigmaBeauty");
R.rules.push(new Rule("^http://(?:www\\.)?sigmabeauty\\.com/", "https://www.sigmabeauty.com/"));
a("www.sigmabeauty.com");
a("sigmabeauty.com");

R = new RuleSet("Silicon.com");
R.rules.push(new Rule("^http://silicon\\.com/", "https://www.silicon.com/"));
R.rules.push(new Rule("^http://www\\.silicon\\.com/", "https://www.silicon.com/"));
a("silicon.com");
a("www.silicon.com");

R = new RuleSet("SilkRoad (partial)");
R.rules.push(new Rule("^http://([\\w\\-]+)\\.silkroad\\.com/", "https://$1.silkroad.com/"));
R.exclusions.push(new Exclusion("^http://(pages|www)\\."));
a("*.silkroad.com");

R = new RuleSet("Silver Oven (partial)");
R.rules.push(new Rule("^http://(www\\.)?investorflow\\.com/", "https://$1investorflow.com/"));
a("investorflow.com");
a("www.investorflow.com");

R = new RuleSet("Silverpop (partial)");
R.rules.push(new Rule("^http://(www\\.)?pages03\\.net/", "https://www.pages03.net/"));
R.rules.push(new Rule("^http://(gw|login1|www1?)\\.vtrenz\\.net/", "https://$1.vtrenz.net/"));
a("pages03.net");
a("www.pages03.net");
a("*.vtrenz.net");

R = new RuleSet("simFlight (partial)");
R.rules.push(new Rule("^http://(?:secure\\.|www\\.)?simmarket\\.com/", "https://secure.simmarket.com/"));
a("simmarket.com");
a("*.simmarket.com");

R = new RuleSet("Simon Butcher");
R.rules.push(new Rule("^http://simon\\.butcher\\.name/", "https://simon.butcher.name/"));
a("simon.butcher.name");

R = new RuleSet("Simply Hired");
R.rules.push(new Rule("^http://([\\w\\-]+\\.)?jobamatic\\.com/", "https://$1jobamatic.com/"));
R.rules.push(new Rule("^http://support\\.simplyhired\\.com/(assets|generated|images|system)/", "https://simplyhired.zendesk.com/$1/"));
a("jobamatic.com");
a("*.jobamatic.com");
a("support.simplyhired.com");

R = new RuleSet("Simyo.de");
R.rules.push(new Rule("^http://www\\.simyo\\.de/", "https://www.simyo.de/"));
a("www.simyo.de");

R = new RuleSet("Simyo.nl");
R.rules.push(new Rule("^http://www\\.simyo\\.nl/", "https://www.simyo.nl/"));
a("www.simyo.nl");

R = new RuleSet("Sinn Fein");
R.rules.push(new Rule("^http://(?:www\\.)?sinnfein\\.ie/", "https://www.sinnfein.ie/"));
a("sinnfein.ie");
a("www.sinnfein.ie");

R = new RuleSet("Sipgate");
R.rules.push(new Rule("^http://(?:(?:www|secure)\\.)?sipgate\\.(at|co\\.uk)/", "https://secure.sipgate.$1/"));
a("sipgate.at");
a("www.sipgate.at");
a("secure.sipgate.at");
a("sipgate.co.uk");
a("www.sipgate.co.uk");
a("secure.sipgate.co.uk");

R = new RuleSet("Site5 (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?site5\\.com/", "https://$1site5.com/"));
R.exclusions.push(new Exclusion("^http://forums\\."));
a("site5.com");
a("*.site5.com");

R = new RuleSet("SiteGround (partial)");
R.rules.push(new Rule("^http://siteground\\.com/", "https://www.siteground.com/"));
R.rules.push(new Rule("^http://(kb|www)\\.siteground\\.com/", "https://$1.siteground.com/"));
a("siteground.com");
a("*.siteground.com");

R = new RuleSet("SiteLock (partial)");
R.rules.push(new Rule("^http://shield\\.sitelock\\.com/", "https://shield.sitelock.com/"));
a("shield.sitelock.com");

R = new RuleSet("SiteTrust Network");
R.rules.push(new Rule("^http://(www\\.)?sitetrustnetwork\\.com/", "https://$1sitetrustnetwork.com/"));
a("sitetrustnetwork.com");
a("www.sitetrustnetwork.com");

R = new RuleSet("sitemeter.com");
R.rules.push(new Rule("^http://www\\.sitemeter\\.com/", "https://www.sitemeter.com/"));
a("www.sitemeter.com");

R = new RuleSet("Sitestat");
R.rules.push(new Rule("^http://nl\\.sitestat\\.com/", "https://nl.sitestat.com/"));
a("nl.sitestat.com");

R = new RuleSet("Sivers");
R.rules.push(new Rule("^http://(?:www\\.)?sivers\\.org/", "https://sivers.org/"));
a("sivers.org");
a("www.sivers.org");

R = new RuleSet("SixApart");
R.rules.push(new Rule("^http://sixapart\\.com/", "https://sixapart.com/"));
R.rules.push(new Rule("^http://(help|www)\\.sixapart\\.com/", "https://$1.sixapart.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?sixapart\\.jp/", "https://www.sixapart.jp/"));
a("sixapart.com");
a("help.sixapart.com");
a("www.sixapart.com");
a("sixapart.jp");
a("www.sixapart.jp");

R = new RuleSet("Sixxs.net");
R.rules.push(new Rule("^http://(?:www\\.)?sixxs\\.net/", "https://www.sixxs.net/"));
a("sixxs.net");
a("www.sixxs.net");

R = new RuleSet("Sizzle Sites");
R.rules.push(new Rule("^http://(www\\.)?sizzlesitesinc\\.com/", "https://$1sizzlesitesinc.com/"));
a("sizzlesitesinc.com");
a("*.sizzlesitesinc.com");

R = new RuleSet("Skandia");
R.rules.push(new Rule("^http://www\\.skandia\\.se/", "https://www.skandia.se/"));
R.rules.push(new Rule("^http://skandia\\.se/", "https://www.skandia.se/"));
a("skandia.se");
a("www.skandia.se");

R = new RuleSet("Skandiabanken");
R.rules.push(new Rule("^http://(?:www\\.)?skandiabanken\\.no/", "https://www.skandiabanken.no/"));
R.rules.push(new Rule("^http://secure\\.skandiabanken\\.no/", "https://secure.skandiabanken.no/"));
R.rules.push(new Rule("^http://trader\\.skandiabanken\\.no/", "https://trader.skandiabanken.no/"));
a("skandiabanken.no");
a("www.skandiabanken.no");
a("secure.skandiabanken.no");
a("trader.skandiabanken.no");

R = new RuleSet("Skat.dk");
R.rules.push(new Rule("^http://(www\\.)?skat\\.dk/", "https://www.skat.dk/"));
a("skat.dk");
a("www.skat.dk");

R = new RuleSet("Skitch");
R.rules.push(new Rule("^http://(?:www\\.)?skitch\\.com/", "https://skitch.com/"));
R.rules.push(new Rule("^http://img\\.skitch\\.com/", "https://img.skitch.com/"));
a("skitch.com");
a("*.skitch.com");

R = new RuleSet("Skydsl.eu");
R.rules.push(new Rule("^http://skydsl\\.eu/", "https://skydsl.eu/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.skydsl\\.eu/", "https://$1.skydsl.eu/"));
a("skydsl.eu");
a("*.skydsl.eu");

R = new RuleSet("SlideShare.net (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?slideshare\\.net/(images/|login/?$|stylesheets/)", "https://slideshare.net/$1"));
R.rules.push(new Rule("^http://(cdn|public|static)\\.slidesharecdn\\.com/", "https://$1.slidesharecdn.com/"));
a("slideshare.net");
a("www.slideshare.net");
a("*.slidesharecdn.com");

R = new RuleSet("Slo-Tech");
R.rules.push(new Rule("^http://(?:www\\.)?slo-tech\\.com/", "https://slo-tech.com/"));
R.rules.push(new Rule("^http://static\\.slo-tech\\.com/", "https://static.slo-tech.com/"));
a("slo-tech.com");
a("www.slo-tech.com");
a("static.slo-tech.com");

R = new RuleSet("Sloan Digital Sky Survey (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?sdss3\\.org/", "https://$1sdss3.org/"));
R.exclusions.push(new Exclusion("^http://www-visualmedia\\."));
a("sdss3.org");
a("*.sdss3.org");

R = new RuleSet("SmartBear (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?alertsite\\.com/", "https://www.alertsite.com/"));
R.rules.push(new Rule("^https?://clientservices\\.automatedqa\\.com/", "https://my.smartbear.com/"));
R.rules.push(new Rule("^http://my\\.smartbear\\.com/", "https://my.smartbear.com/"));
R.rules.push(new Rule("^http://login\\.softwareplanner\\.com/", "https://login.softwareplanner.com/"));
a("alertsite.com");
a("www.alertsite.com");
a("clientservices.automatedqa.com");
a("my.smartbear.com");
a("login.softwareplanner.com");

R = new RuleSet("SmartFTP");
R.rules.push(new Rule("^http://(?:www\\.)?smartftp\\.com/", "https://www.smartftp.com/"));
a("smartftp.com");
a("www.smartftp.com");

R = new RuleSet("SmartPractice");
R.rules.push(new Rule("^http://(www\\.)?(allerderm|finnchamber)\\.com/", "https://$2.com/"));
a("allerderm.com");
a("www.allerderm.com");
a("finnchamber.com");
a("www.finnchamber.com");

R = new RuleSet("SmartRecruiters (partial)");
R.rules.push(new Rule("^http://www\\.smartrecruiters\\.com/(img|static)/", "https://www.smartrecruiters.com/$1/"));
a("www.smartrecruiters.com");

R = new RuleSet("SMJG");
R.rules.push(new Rule("^http://((www)|(forum))\\.smjg\\.org/", "https://$1.smjg.org/"));
R.rules.push(new Rule("^http://smjg\\.org/", "https://smjg.org/"));
a("www.smjg.org");
a("forum.smjg.org");
a("smjg.org");

R = new RuleSet("snagajob");
R.rules.push(new Rule("^http://(?:www\\.)?snagajob\\.com/", "https://www.snagajob.com/"));
R.rules.push(new Rule("^http://media\\.snagajob\\.com/", "https://media.snagajob.com/"));
R.exclusions.push(new Exclusion("^http://www\\.snagajob\\.com/answers/"));
R.exclusions.push(new Exclusion("^http://www\\.snagajob\\.com/blog/"));
a("snagajob.com");
a("www.snagajob.com");
a("*.snagajob.com");

R = new RuleSet("So Raise Your Glasses");
R.rules.push(new Rule("^http://(www\\.)?soraiseyourglasses\\.com/", "https://$1soraiseyourglasses.com/"));
a("soraiseyourglasses.com");
a("www.soraiseyourglasses.com");

R = new RuleSet("Soapbox CMS");
R.rules.push(new Rule("^http://(www\\.)?soapboxcms\\.com/", "https://$1soapboxcms.com/"));
a("soapboxcms.com");
a("*.soapboxcms.com");

R = new RuleSet("Social Science Research Network (partial)");
R.rules.push(new Rule("^http://ssrn\\.com/", "https://www.ssrn.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.ssrn\\.com/", "https://$1.ssrn.com/"));
a("ssrn.com");
a("*.ssrn.com");

R = new RuleSet("US Social Security Administration");
R.rules.push(new Rule("^((http://(www\\.)?)|(https://))socialsecurity\\.gov/", "https://www.socialsecurity.gov/"));
R.rules.push(new Rule("^((http://((ftp|www)\\.)?)|https://(www\\.)?)ssa\\.gov/", "https://www.socialsecurity.gov/"));
R.rules.push(new Rule("^http://(secure|stats)\\.ssa\\.gov/", "https://$1.ssa.gov/"));
a("socialsecurity.gov");
a("www.socialsecurity.gov");
a("ssa.gov");
a("ftp.ssa.gov");
a("secure.ssa.gov");
a("stats.ssa.gov");
a("www.ssa.gov");

R = new RuleSet("socialbakers.com");
R.rules.push(new Rule("^http://(\\w+\\.)?socialbakers\\.com/", "https://$1socialbakers.com/"));
a("socialbakers.com");
a("*.socialbakers.com");

R = new RuleSet("SocietyForScience.org");
R.rules.push(new Rule("^http://www\\.societyforscience\\.org/", "https://www.societyforscience.org/"));
R.rules.push(new Rule("^http://societyforscience\\.org/", "https://societyforscience.org/"));
a("www.societyforscience.org");
a("societyforscience.org");

R = new RuleSet("SodaHead.com (partial)");
R.rules.push(new Rule("^http://(www\\.)?sodahead\\.com/", "https://www.sodahead.com/"));
R.rules.push(new Rule("^http://widgets\\.sodahead\\.com/", "https://s3.amazonaws.com/widgets.sodahead.com/"));
a("sodahead.com");
a("widgets.sodahead.com");
a("www.sodahead.com");

R = new RuleSet("SoftCom (partial)");
R.rules.push(new Rule("^http://(www\\.)?daha\\.net/(assets/|fancybox/|\\w+\\.(css|ico|png)|[\\w\\-/]*images/)", "https://$1daha.net/$2"));
R.rules.push(new Rule("^http://(banman\\.|www\\.)?mail2web\\.com/", "https://$1mail2web.com/"));
R.rules.push(new Rule("^http://(www\\.)?myhosting\\.com/", "https://$1myhosting.com/"));
R.rules.push(new Rule("^http://assets\\d*\\.myhosting\\.com/", "https://d2b9wiydujghh5.cloudfront.net/"));
R.rules.push(new Rule("^http://(www\\.)?slhost\\.com/", "https://$1slhost.com/"));
R.rules.push(new Rule("^http://helpdesk\\.softcom\\.com/", "https://helpdesk.softcom.com/"));
a("daha.net");
a("www.daha.net");
a("mail2web.com");
a("*.mail2web.com");
a("myhosting.com");
a("*.myhosting.com");
a("slhost.com");
a("*.slhost.com");
a("helpdesk.softcom.com");

R = new RuleSet("Software Freedom Law Center");
R.rules.push(new Rule("^http://(?:www\\.)?softwarefreedom\\.org/", "https://www.softwarefreedom.org/"));
a("softwarefreedom.org");
a("www.softwarefreedom.org");

R = new RuleSet("Sony-Europe.com");
R.rules.push(new Rule("^http://sp\\.sony-europe\\.com/", "https://sp.sony-europe.com/"));
R.rules.push(new Rule("^http://sony-europe\\.com/", "https://sony-europe.com/"));
R.rules.push(new Rule("^http://www\\.sony-europe\\.com/", "https://www.sony-europe.com/"));
a("sp.sony-europe.com");
a("sony-europe.com");
a("www.sony-europe.com");

R = new RuleSet("Sony.se");
R.rules.push(new Rule("^http://www\\.sony\\.se/", "https://www.sony.se/"));
R.rules.push(new Rule("^http://sony\\.se/", "https://sony.se/"));
a("sony.se");
a("www.sony.se");

R = new RuleSet("Sony (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?sony\\.com/", "https://www.sony.com/"));
a("sony.com");
a("www.sony.com");

R = new RuleSet("SonyMusic");
R.rules.push(new Rule("^http://(?:www\\.)?sonymusic\\.com/", "https://www.sonymusic.com/"));
a("sonymusic.com");
a("www.sonymusic.com");

R = new RuleSet("Sophos (partial)");
R.rules.push(new Rule("^http://(gpp\\.partners|secure|solo)\\.sophos\\.com/", "https://$1.sophos.com/"));
a("gpp.partners.sophos.com");
a("*.sophos.com");

R = new RuleSet("Soton.ac.uk");
R.rules.push(new Rule("^http://www\\.soton\\.ac\\.uk/", "https://www.soton.ac.uk/"));
a("www.soton.ac.uk");

R = new RuleSet("SoundUnwound");
R.rules.push(new Rule("^http://(www\\.)?soundunwound\\.com/", "https://www.soundunwound.com/"));
a("soundunwound.com");
a("www.soundunwound.com");

R = new RuleSet("Sounds True");
R.rules.push(new Rule("^http://(?:www\\.)?soundstrue\\.com/((assets/|media)\\.soundstrue\\.com/|catalog/|/?components/|css/|directaccess/|email/|google/ga\\.js|linkshare/|pages/popup_shipping\\.php|shipping/|shop/(login\\.do|player/|st_assets/)|wakeup/|pages/popup_shipping\\.php)", "https://www.soundstrue.com/$1"));
R.rules.push(new Rule("^http://assets\\.soundstrue\\.com/", "https://assets.soundstrue.com/"));
R.rules.push(new Rule("^http://components\\.soundstrue\\.com/", "https://assets.soundstrue.com/components/public/"));
a("soundstrue.com");
a("*.soundstrue.com");

R = new RuleSet("Source Forge (partial)");
R.rules.push(new Rule("^http://(images|lists|prdownloads|sflogo|static)\\.(?:sf|sourceforge)\\.(?:jp|net)/", "https://$1.sourceforge.net/"));
R.rules.push(new Rule("^http://downloads\\.s(?:f|ourceforge)\\.net/project/([^\\?]+)\\?r=http%3A%2F%2Fs", "https://downloads.sourceforge.net/project/$1?r=https%3A%2F%2Fs"));
R.rules.push(new Rule("^http://(?:www\\.)?(?:sf|sourceforge)\\.(jp|net)/(accounts|images)/", "https://sourceforge.net/images/"));
R.rules.push(new Rule("^http://(?:www\\.)?(?:sf|sourceforge)\\.net/sflogo\\.php", "https://sourceforge.net/sflogo.php"));
a("sf.net");
a("downloads.sf.net");
a("lists.sf.net");
a("prdownloads.sf.net");
a("sflogo.sf.net");
a("static.sf.net");
a("www.sf.net");
a("sourceforge.jp");
a("sourceforge.net");
a("downloads.sourceforge.net");
a("images.sourceforge.net");
a("lists.sourceforge.net");
a("prdownloads.sourceforge.net");
a("sflogo.sourceforge.net");
a("sflogo.sourceforge.jp");
a("static.sourceforge.net");
a("www.sourceforge.jp");
a("www.sourceforge.net");

R = new RuleSet("SouthernElectric");
R.rules.push(new Rule("^http://(?:www\\.)?southern-electric\\.co\\.uk/", "https://www.southern-electric.co.uk/"));
a("southern-electric.co.uk");
a("www.southern-electric.co.uk");

R = new RuleSet("Space Inch (partial)");
R.rules.push(new Rule("^http://(www\\.)?godownloadsongs\\.com/", "https://godownloadsongs.com/"));
R.rules.push(new Rule("^http://(www\\.)?skipscreen\\.com/", "https://skipscreen.com/"));
a("godownloadsongs.com");
a("www.godownloadsongs.com");
a("skipscreen.com");
a("www.skipscreen.com");

R = new RuleSet("SpamGourmet");
R.rules.push(new Rule("^http://spamgourmet\\.com/", "https://spamgourmet.com/"));
R.rules.push(new Rule("^http://www\\.spamgourmet\\.com/", "https://www.spamgourmet.com/"));
a("spamgourmet.com");
a("www.spamgourmet.com");

R = new RuleSet("Spanair");
R.rules.push(new Rule("^http://spanair\\.com/", "https://spanair.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.spanair\\.com/", "https://$1.spanair.com/"));
a("spanair.com");
a("*.spanair.com");

R = new RuleSet("Sparked");
R.rules.push(new Rule("^http://www\\.sparked\\.com/", "https://www.sparked.com/"));
a("www.sparked.com");

R = new RuleSet("Sparkfun");
R.rules.push(new Rule("^http://(?:www\\.)?sparkfun\\.com/", "https://www.sparkfun.com/"));
R.rules.push(new Rule("^http://static\\.sparkfun\\.com/", "https://static.sparkfun.com/"));
a("sparkfun.com");
a("www.sparkfun.com");
a("static.sparkfun.com");

R = new RuleSet("Sparkstudios.com");
R.rules.push(new Rule("^http://www\\.sparkstudios\\.com/", "https://www.sparkstudios.com/"));
R.rules.push(new Rule("^http://sparkstudios\\.com/", "https://www.sparkstudios.com/"));
a("www.sparkstudios.com");
a("sparkstudios.com");

R = new RuleSet("SpecialForces");
R.rules.push(new Rule("^http://(?:www\\.)?specialforces\\.com/", "https://www.specialforces.com/"));
a("specialforces.com");
a("www.specialforces.com");

R = new RuleSet("SpiderOak");
R.rules.push(new Rule("^http://(www\\.)?spideroak\\.com/", "https://$1spideroak.com/"));
a("spideroak.com");
a("www.spideroak.com");

R = new RuleSet("Spin.de");
R.rules.push(new Rule("^http://(?:www\\.)?spin\\.de/", "https://www.spin.de/"));
a("spin.de");
a("www.spin.de");

R = new RuleSet("Spirit Airlines");
R.rules.push(new Rule("^http://spirit\\.com/", "https://spirit.com/"));
R.rules.push(new Rule("^http://www\\.spirit\\.com/", "https://www.spirit.com/"));
a("spirit.com");
a("www.spirit.com");

R = new RuleSet("Splendid Bacon");
R.rules.push(new Rule("^http://(www\\.)?splendidbacon\\.com/", "https://splendidbacon.com/"));
a("splendidbacon.com");
a("www.splendidbacon.com");

R = new RuleSet("Spoki");
R.rules.push(new Rule("^http://(?:img\\d\\w)?www\\.spoki\\.lv/", "https://www.spoki.lv/"));
a("spoki.lv");
a("*.spoki.lv");
a("*.www.spoki.lv");

R = new RuleSet("Spontex.org");
R.rules.push(new Rule("^http://spontex\\.org/", "https://spontex.org/"));
R.rules.push(new Rule("^http://(adminmedia|m|www|fr|en|stats|media)\\.spontex\\.org/", "https://$1.spontex.org/"));
a("spontex.org");
a("www.spontex.org");
a("fr.spontex.org");
a("en.spontex.org");
a("media.spontex.org");
a("stats.spontex.org");
a("m.spontex.org");
a("adminmedia.spontex.org");

R = new RuleSet("Spreadshirt");
R.rules.push(new Rule("^http://spreadshirt\\.(co(m|\\.uk)|net)/", "https://www.spreadshirt.$1/"));
R.rules.push(new Rule("^http://(\\w+)\\.spreadshirt\\.(co(m|\\.uk)|net)/", "https://$1.spreadshirt.$2/"));
a("spreadshirt.com");
a("*.spreadshirt.com");
a("spreadshirt.co.uk");
a("*.spreadshirt.co.uk");
a("spreadshirt.net");
a("*.spreadshirt.net");

R = new RuleSet("Springer (partial)");
R.rules.push(new Rule("^http://(www\\.)?springer\\.com/", "https://www.springer.com/"));
R.rules.push(new Rule("^http://(www\\.)?springer-gabler\\.de/", "https://springer-gabler.de/"));
R.rules.push(new Rule("^http://(www\\.)?springerlink\\.com/(branding/|content/.+\\.(jpg|pdf)|dynamic-file\\.axd|images/|styles/)", "https://www.springerlink.com/$2"));
R.rules.push(new Rule("^http://(www\\.)?springerzahnmedizin\\.de/(code|css|img|servlet)/", "https://springerzahnmedizin.de/$2/"));
a("springer.com");
a("www.springer.com");
a("springer-gabler.de");
a("www.springer-gabler.de");
a("springerlink.com");
a("www.springerlink.com");
a("springerzahnmedizin.de");
a("www.springerzahnmedizin.de");

R = new RuleSet("Springpad");
R.rules.push(new Rule("^http://(?:www\\.)?springpadit\\.com/", "https://springpadit.com/"));
a("springpadit.com");
a("www.springpadit.com");

R = new RuleSet("Sprint.com");
R.rules.push(new Rule("^http://(?:www\\.)?sprint\\.com/", "https://www.sprint.com/"));
a("sprint.com");
a("www.sprint.com");

R = new RuleSet("Spyderco");
R.rules.push(new Rule("^http://(www\\.)?spyderco\\.com/", "https://$1spyderco.com/"));
a("spyderco.com");
a("www.spyderco.com");

R = new RuleSet("Squarespace (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?sqsp\\.com/", "https://$1sqsp.com/"));
R.rules.push(new Rule("^http://squarespace\\.com/", "https://www.squarespace.com/"));
R.rules.push(new Rule("^http://blog\\.squarespace\\.com/(assets/|blog/storage/|site\\.css)", "https://blog.squarespace.com/blog/$1"));
R.rules.push(new Rule("^http://cachefly\\.squarespace\\.com/", "https://squarespace.cachefly.net/"));
R.rules.push(new Rule("^http://s3\\.media\\.squarespace\\.com/", "https://s3.amazonaws.com/s3.media.squarespace.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.squarespace\\.com/(display/|favicon\\.ico|storage/|universal/)", "https://$1.squarespace.com/$2"));
a("sqsp.com");
a("*.sqsp.com");
a("squarespace.com");
a("s3.media.squarespace.com");
a("*.squarespace.com");

R = new RuleSet("Square");
R.rules.push(new Rule("^http://(www\\.)?squareup\\.com/", "https://squareup.com/"));
a("squareup.com");
a("www.squareup.com");

R = new RuleSet("Squirrel-webmail.surftown.com");
R.rules.push(new Rule("^http://squirrel-webmail\\.surftown\\.com/", "https://squirrel-webmail.surftown.com/"));
a("squirrel-webmail.surftown.com");

R = new RuleSet("Srware");
R.rules.push(new Rule("^http://(?:www\\.)?srware\\.net/", "https://www.srware.net/"));
a("srware.net");
a("www.srware.net");

R = new RuleSet("Stack Exchange (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(askubuntu|serverfault|stackoverflow|superuser)\\.com/favicon\\.ico", "https://cdn.sstatic.net/$1/img/favicon.ico"));
R.rules.push(new Rule("^http://(?:www\\.)?blogoverflow\\.com/$", "https://stackexchange.com/blogs"));
R.rules.push(new Rule("^http://(?:cdn\\.)?sstatic\\.net/", "https://cdn.sstatic.net/"));
R.rules.push(new Rule("^http://(meta\\.|www\\.)?stackexchange\\.com/", "https://$1stackexchange.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.stackexchange\\.com/favicon\\.ico", "https://cdn.sstatic.net/$1/img/favicon.ico"));
R.rules.push(new Rule("^http://app\\.stacktack\\.com/", "https://s3.amazonaws.com/stacktackapp/"));
R.rules.push(new Rule("^http://meta\\.superuser\\.com/favicon\\.ico", "https://cdn.sstatic.net/superusermeta/img/favicon.ico"));
a("askubuntu.com");
a("www.askubuntu.com");
a("blogoverflow.com");
a("www.blogoverflow.com");
a("sstatic.net");
a("cdn.sstatic.net");
a("serverfault.com");
a("www.serverfault.com");
a("stackexchange.com");
a("*.stackexchange.com");
a("stackoverflow.com");
a("www.stackoverflow.com");
a("app.stacktack.com");
a("superuser.com");
a("www.superuser.com");

R = new RuleSet("Stanford University (partial)");
R.rules.push(new Rule("^http://(crypto|news\\.slac)\\.stanford\\.edu/", "https://$1.stanford.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?slac\\.stanford\\.edu/", "https://www.slac.stanford.edu/"));
R.rules.push(new Rule("^https://www6\\.slac\\.stanford\\.edu/", "http://www6.slac.stanford.edu/"));
a("crypto.stanford.edu");
a("slac.stanford.edu");
a("news.slac.stanford.edu");
a("*.news.slac.stanford.edu");
a("www.slac.stanford.edu");
a("www6.slac.stanford.edu");

R = new RuleSet("Starfield Technologies, Inc.");
R.rules.push(new Rule("^http://starfieldtech\\.com/", "https://www.starfieldtech.com/"));
R.rules.push(new Rule("^http://(certs|certificates|seal|tracedseals|www)\\.starfieldtech\\.com/", "https://$1.starfieldtech.com/"));
a("starfieldtech.com");
a("certs.starfieldtech.com");
a("certificates.starfieldtech.com");
a("seal.starfieldtech.com");
a("tracedseals.starfieldtech.com");
a("www.starfieldtech.com");

R = new RuleSet("StartCom");
R.rules.push(new Rule("^http://([^/:@\\.]*\\.)?startssl\\.(com|net|org|eu|us)/", "https://$1startssl.$2/"));
R.rules.push(new Rule("^http://([^/:@\\.]*\\.)?startcom\\.org/", "https://$1startcom.org/"));
R.exclusions.push(new Exclusion("ocsp\\.startcom"));
R.exclusions.push(new Exclusion("ocsp\\.startssl"));
R.exclusions.push(new Exclusion("\\.crl$"));
R.exclusions.push(new Exclusion("\\.crt$"));
a("startssl.com");
a("*.startssl.com");
a("startssl.net");
a("*.startssl.net");
a("startssl.org");
a("*.startssl.org");
a("startssl.eu");
a("*.startssl.eu");
a("startssl.us");
a("*.startssl.us");
a("startcom.org");
a("*.startcom.org");

R = new RuleSet("StartLogic");
R.rules.push(new Rule("^http://(www\\.)?(secure\\.)?startlogic\\.com/", "https://$2startlogic.com/"));
a("startlogic.com");
a("*.startlogic.com");

R = new RuleSet("Starwood Hotels & Resorts");
R.rules.push(new Rule("^http://(?:www\\.)?starwoodhotels\\.com/", "https://www.starwoodhotels.com/"));
a("starwoodhotels.com");
a("www.starwoodhotels.com");
a("*.www.starwoodhotels.com");

R = new RuleSet("Statcounter");
R.rules.push(new Rule("^http://([^/:@\\.]+\\.)?statcounter\\.com/", "https://$1statcounter.com/"));
R.rules.push(new Rule("^https?://www\\.statcounter\\.com/", "https://statcounter.com/"));
R.rules.push(new Rule("^https?://gs.statcounter.com/(cs|image)s/", "https://statcounter.com/$1s/"));
R.rules.push(new Rule("^https?://www-beta\\.statcounter\\.com/", "https://statcounter.com/"));
R.rules.push(new Rule("^https://gs\\.statcounter\\.com/($|MSLine\\.swf)", "http://gs.statcounter.com/$1"));
R.exclusions.push(new Exclusion("^http://gs\\.statcounter\\.com/($|MSLine\\.swf)"));
a("statcounter.com");
a("*.statcounter.com");

R = new RuleSet("StateFarm");
R.rules.push(new Rule("^http://(?:www\\.)?statefarm\\.com/", "https://www.statefarm.com/"));
R.rules.push(new Rule("^http://(sfsecuremail|online2?)\\.statefarm\\.com/", "https://$1.statefarm.com/"));
a("statefarm.com");
a("www.statefarm.com");
a("sfsecuremail.statefarm.com");
a("online.statefarm.com");
a("online2.statefarm.com");

R = new RuleSet("Statistik-gallup.net");
R.rules.push(new Rule("^http://statistik-gallup\\.net/", "https://statistik-gallup.net/"));
a("statistik-gallup.net");

R = new RuleSet("StatistikamtBayern");
R.rules.push(new Rule("^http://(www\\.)?statistik\\.bayern\\.de/", "https://www.statistik.bayern.de/"));
a("www.statistik.bayern.de");
a("statistik.bayern.de");

R = new RuleSet("StatusNet (partial)");
R.rules.push(new Rule("^http://(avatar3|file|plugins1|theme1)\\.status\\.net/", "https://$1.status.net/"));
a("*.status.net");

R = new RuleSet("StayFriends");
R.rules.push(new Rule("^http://(?:www\\.)?stayfriends\\.(at|ch|de)/", "https://www.stayfriends.$1/"));
a("stayfriends.de");
a("www.stayfriends.de");
a("stayfriends.at");
a("www.stayfriends.at");
a("stayfriends.ch");
a("www.stayfriends.ch");

R = new RuleSet("Stealthnews.com");
R.rules.push(new Rule("^http://(www\\.)?stealthnews\\.com/", "https://$1stealthnews.com/"));
a("stealthnews.com");
a("*.stealthnews.com");

R = new RuleSet("Stelter (partial)");
R.rules.push(new Rule("^http://(www\\.)?(?:gftplns\\.org|plan\\.gs)/", "https://$1gftplns.org/"));
R.rules.push(new Rule("^http://dashboard\\.stelter\\.com(:\\d{1,4})?/", "https://dashboard.stelter.com$1/"));
a("gftplns.org");
a("www.gftplns.org");
a("plan.gs");
a("www.plan.gs");
a("dashboard.stelter.com");

R = new RuleSet("Stevens", "http:.*\\.stevens\\.");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.stevens\\.edu/", "https://$1.stevens.edu/"));
R.exclusions.push(new Exclusion("^http://(personal|www.math|www.cs|www.acc|guinness.cs|tarantula.phy|www.phy|tarantula.srcit|www.srcit|debian.srcit|ubuntu.srcit)\\.stevens\\.edu/.*"));
a("*.stevens.edu");

R = new RuleSet("Stopbadware.org");
R.rules.push(new Rule("^http://(?:www\\.)?stopbadware\\.org/", "https://stopbadware.org/"));
a("stopbadware.org");
a("www.stopbadware.org");

R = new RuleSet("Storebrand");
R.rules.push(new Rule("^http://storebrand\\.no/", "https://www.storebrand.no/"));
R.rules.push(new Rule("^http://www\\.storebrand\\.no/", "https://www.storebrand.no/"));
a("storebrand.no");
a("www.storebrand.no");

R = new RuleSet("Stripe.com");
R.rules.push(new Rule("^http://(www\\.)?stripe\\.com/", "https://stripe.com/"));
a("stripe.com");
a("www.stripe.com");

R = new RuleSet("StrongVPN.com");
R.rules.push(new Rule("^http://strongvpn\\.com/", "https://strongvpn.com/"));
R.rules.push(new Rule("^http://www\\.strongvpn\\.com/", "https://www.strongvpn.com/"));
a("strongvpn.com");
a("www.strongvpn.com");

R = new RuleSet("StudentLoans.gov");
R.rules.push(new Rule("^http://(?:www\\.)?studentloans\\.gov/", "https://studentloans.gov/"));
a("studentloans.gov");
a("www.studentloans.gov");

R = new RuleSet("subimage (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(?:cashboardapp|getcashboard)\\.com/", "https://www.cashboardapp.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.cashboardapp\\.com/", "https://$1.cashboardapp.com/"));
a("cashboardapp.com");
a("*.cashboardapp.com");
a("getcashboard.com");
a("www.getcashboard.com");

R = new RuleSet("Submission Technology");
R.rules.push(new Rule("^http://(ssl\\.|www\\.)?submissiontechnology\\.co\\.uk/", "https://$1submissiontechnology.co.uk/"));
a("submissiontechnology.co.uk");
a("*.submissiontechnology.co.uk");

R = new RuleSet("SunTrust");
R.rules.push(new Rule("^http://suntrust\\.com/", "https://www.suntrust.com/"));
R.rules.push(new Rule("^http://(answers|blog|esp|giftcard|online401k|onlinecourier|otm|rewards|www)\\.suntrust\\.com/", "https://$1.suntrust.com/"));
a("suntrust.com");
a("*.suntrust.com");

R = new RuleSet("Sunbeltsoftware.com");
R.rules.push(new Rule("^http://www\\.sunbeltsoftware\\.com/", "https://www.sunbeltsoftware.com/"));
R.rules.push(new Rule("^http://sunbeltsoftware\\.com/", "https://www.sunbeltsoftware.com/"));
a("sunbeltsoftware.com");
a("www.sunbeltsoftware.com");

R = new RuleSet("Sunlight Foundation (partial)");
R.rules.push(new Rule("^http://inbox\\.influenceexplorer\\.com/", "https://inbox.influenceexplorer.com/"));
R.rules.push(new Rule("^http://assets\\.sunlightfoundation\\.com/", "https://s3.amazonaws.com/assets.sunlightfoundation.com/"));
a("inbox.influenceexplorer.com");
a("assets.sunlightfoundation.com");

R = new RuleSet("SuperAntiSpyware");
R.rules.push(new Rule("^http://(?:www\\.)?superantispyware\\.com/", "https://www.superantispyware.com/"));
a("www.superantispyware.com");
a("superantispyware.com");

R = new RuleSet("SuperMedia (partial)");
R.rules.push(new Rule("^http://s\\.cdnwp\\.com/", "https://s.cdnwp.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?directorystore\\.com/", "https://www.directorystore.com/"));
R.rules.push(new Rule("^http://(www\\.)?superguarantee\\.com/", "https://$1superguarantee.com/"));
R.rules.push(new Rule("^http://(my\\.|www\\.)?supermedia\\.com/", "https://$1supermedia.com/"));
R.rules.push(new Rule("^http://superpages\\.com/", "https://www.superpages.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?(?:switchboard|whiteboard)\\.com/(cache/|common/|switchboard/)", "https://s.cdnwp.com/$1"));
R.rules.push(new Rule("^http://(?:jscss|yellowpages)\\.superpages\\.com/", "https://yellowpages.superpages.com/"));
R.rules.push(new Rule("^http://whitepages\\.com/", "https://www.whitepages.com/"));
R.rules.push(new Rule("^http://pro\\.whitepages\\.com/", "https://pro.whitepages.com/"));
a("s.cdnwp.com");
a("directorystore.com");
a("*.directorystore.com");
a("superguarantee.com");
a("*.superguarantee.com");
a("supermedia.com");
a("*.supermedia.com");
a("superpages.com");
a("*.superpages.com");
a("switchboard.com");
a("www.switchboard.com");
a("whitepages.com");
a("*.whitepages.com");

R = new RuleSet("Superdrug (partial)");
R.rules.push(new Rule("^http://(www\\.)?superdrug\\.com/", "https://$1superdrug.com/"));
a("superdrug.com");
a("www.superdrug.com");
a("*.www.superdrug.com");

R = new RuleSet("Superstart.se");
R.rules.push(new Rule("^http://www\\.superstart\\.se/", "https://www.superstart.se/"));
R.rules.push(new Rule("^http://static\\.superstart\\.se/", "https://static.superstart.se/"));
R.rules.push(new Rule("^http://superstart\\.se/", "https://www.superstart.se/"));
a("superstart.se");
a("www.superstart.se");
a("static.superstart.se");

R = new RuleSet("Surftown.com");
R.rules.push(new Rule("^http://(www\\.)?surftown\\.com/", "https://www.surftown.com/"));
a("surftown.com");
a("www.surftown.com");

R = new RuleSet("SurveyGizmo.com");
R.rules.push(new Rule("^http://(www\\.)?surveygizmo\\.com/", "https://www.surveygizmo.com/"));
R.rules.push(new Rule("^http://(app|pro[0-9][0-9]?)\\.sgizmo\\.com/", "https://$1.sgizmo.com/"));
a("surveygizmo.com");
a("www.surveygizmo.com");
a("*.sgizmo.com");

R = new RuleSet("Surveydaddy");
R.rules.push(new Rule("^http://surveydaddy\\.com/", "https://surveydaddy.com/"));
R.rules.push(new Rule("^http://([^@:\\./]+)\\.surveydaddy\\.com/", "https://$1.surveydaddy.com/"));
R.exclusions.push(new Exclusion("^http://support\\.surveydaddy\\.com/"));
a("surveydaddy.com");
a("*.surveydaddy.com");

R = new RuleSet("Survs (partial)");
R.rules.push(new Rule("^http://(www\\.)?survs\\.com/", "https://$1survs.com/"));
R.exclusions.push(new Exclusion("^http://www\\.survs\\.com/survey/"));
a("survs.com");
a("www.survs.com");

R = new RuleSet("Svenskakyrkan");
R.rules.push(new Rule("^http://svenskakyrkan\\.se/", "https://www.svenskakyrkan.se/"));
R.rules.push(new Rule("^http://www\\.svenskakyrkan\\.se/", "https://www.svenskakyrkan.se/"));
a("svenskakyrkan.se");
a("www.svenskakyrkan.se");

R = new RuleSet("Svenskaspel.se");
R.rules.push(new Rule("^http://svenskaspel\\.se/", "https://svenskaspel.se/"));
R.rules.push(new Rule("^http://www\\.svenskaspel\\.se/", "https://svenskaspel.se/"));
a("svenskaspel.se");

R = new RuleSet("SverigesRadio");
R.rules.push(new Rule("^http://www\\.sverigesradio\\.se/", "https://sverigesradio.se/"));
R.rules.push(new Rule("^http://sverigesradio\\.se/", "https://sverigesradio.se/"));
R.rules.push(new Rule("^http://sr\\.se/", "https://sverigesradio.se/"));
R.rules.push(new Rule("^http://www\\.sr\\.se/", "https://sverigesradio.se/"));
a("sverigesradio.se");
a("www.sverigesradio.se");
a("sr.se");
a("www.sr.se");

R = new RuleSet("SwetsWise");
R.rules.push(new Rule("^http://(www\\.)?swetswise\\.com/", "https://www.swetswise.com/"));
a("swetswise.com");
a("www.swetswise.com");

R = new RuleSet("Swiss.com");
R.rules.push(new Rule("^http://(?:www\\.)?swiss\\.com/", "https://www.swiss.com/"));
R.rules.push(new Rule("^http://lsy-www\\.swiss\\.com/", "https://lsy-www.swiss.com/"));
R.rules.push(new Rule("^http://booking\\.swiss\\.com/", "https://booking.swiss.com/"));
a("swiss.com");
a("www.swiss.com");
a("lsy-www.swiss.com");
a("booking.swiss.com");

R = new RuleSet("switch.ch");
R.rules.push(new Rule("^http://(?:www\\.)?switch\\.ch/", "https://www.switch.ch/"));
a("switch.ch");
a("www.switch.ch");

R = new RuleSet("Sycom.co.jp");
R.rules.push(new Rule("^http://(www\\.)?sycom\\.co\\.jp/", "https://www.sycom.co.jp/"));
a("sycom.co.jp");
a("www.sycom.co.jp");

R = new RuleSet("Sydostran.se");
R.rules.push(new Rule("^http://sydostran\\.se/", "https://www.sydostran.se/"));
R.rules.push(new Rule("^http://www\\.sydostran\\.se/", "https://www.sydostran.se/"));
a("sydostran.se");
a("www.sydostran.se");

R = new RuleSet("Syllabusshare (mismatches)");
R.rules.push(new Rule("^http://(?:www\\.)?syllabusshare\\.com/", "https://syllabusshare.com/"));
a("syllabusshare.com");
a("www.syllabusshare.com");

R = new RuleSet("Syllabusshare (partial)");
R.rules.push(new Rule("^http://secure\\.syllabushare\\.com/", "https://secure.syllabushare.com/"));
a("secure.syllabushare.com");

R = new RuleSet("Symantec (partial)");
R.rules.push(new Rule("^http://(mynortonaccount|norton|symantec|verisignlabs)\\.com/", "https://www.$1.com/"));
R.rules.push(new Rule("^http://(account|buy(-static1?)?|now-static|onlinefamily|safeweb|static-wap|us|www)\\.norton\\.com/", "https://$1.norton.com/"));
R.rules.push(new Rule("^http://(oms|productadvisor|sitedirector|solutions|webdl|www(-secure)?)\\.symantec\\.com/", "https://$1.symantec.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?verisign\\.(\\w{2,6})/", "https://www.verisign.$1/"));
R.rules.push(new Rule("^http://(\\w{4,22})\\.verisign\\.(\\w{2,6})/", "https://$1.verisign.$2/"));
R.rules.push(new Rule("^http://knowledge\\.verisign-grs\\.com/", "https://knowledge.verisign-grs.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?verisign(inc|-japan-domain)\\.com/", "https://www.verisign$1.com/"));
R.rules.push(new Rule("^http://(pip|www)\\.verisignlabs\\.com/", "https://$1.verisignlabs.com/"));
R.exclusions.push(new Exclusion("^http://verisigntransition101\\.verisign\\.\\w{2,6}/"));
a("mynortonaccount.com");
a("www.mynortonaccount.com");
a("norton.com");
a("account.norton.com");
a("buy.norton.com");
a("buy-static.norton.com");
a("buy-static1.norton.com");
a("now-static.norton.com");
a("onlinefamily.norton.com");
a("safeweb.norton.com");
a("static-wap.norton.com");
a("us.norton.com");
a("www.norton.com");
a("symantec.com");
a("oms.symantec.com");
a("productadvisor.symantec.com");
a("sitedirector.symantec.com");
a("solutions.symantec.com");
a("webdl.symantec.com");
a("www.symantec.com");
a("www-secure.symantec.com");
a("verisign.be");
a("www.verisign.be");
a("verisign.ch");
a("knowledge.verisign.ch");
a("ssl-certificate-center.verisign.ch");
a("trust-center.verisign.ch");
a("www.verisign.ch");
a("verisign.com");
a("blogs.verisign.com");
a("enterprise-ssl-admin.verisign.com");
a("extended-validation-ssl.verisign.com");
a("idprotect.verisign.com");
a("idefense.verisign.com");
a("investor.verisign.com");
a("labs.verisign.com");
a("mdns.verisign.com");
a("products.verisign.com");
a("seal.verisign.com");
a("ssl-certificate-center.verisign.com");
a("trust-center.verisign.com");
a("vidn.verisign.com");
a("www.verisign.com");
a("verisign.com.au");
a("knowledge.verisign.com.au");
a("mygatekeeper.verisign.com.au");
a("ssl-certificate-center.verisign.com.au");
a("tracking.verisign.com.au");
a("trust-center.verisign.com.au");
a("www.verisign.com.au");
a("verisign.com.br");
a("www.verisign.com.br");
a("verisign.com.hk");
a("knowledge.verisign.com.hk");
a("ssl-certificate-center.verisign.com.hk");
a("tracking.verisign.com.hk");
a("trust.verisign.com.hk");
a("www.verisign.com.hk");
a("verisign.com.sg");
a("knowledge.verisign.com.sg");
a("ssl-certificate-center.verisign.com.sg");
a("trust-center.verisign.com.sg");
a("www.verisign.com.sg");
a("verisign.com.tw");
a("knowledge.verisign.com.tw");
a("ssl-certificate-center.verisign.com.tw");
a("tracking.verisign.com.tw");
a("trust-center.verisign.com.tw");
a("www.verisign.com.tw");
a("verisign.co.jp");
a("storefront.verisign.co.jp");
a("www.verisign.co.jp");
a("verisign.co.nz");
a("knowledge.verisign.co.nz");
a("tracking.verisign.co.nz");
a("www.verisign.co.nz");
a("verisign.co.uk");
a("knowledge.verisign.co.uk");
a("ssl-certificate-center.verisign.co.uk");
a("trust-center.verisign.co.uk");
a("www.verisign.co.uk");
a("verisign.dk");
a("knowledge.verisign.dk");
a("ssl-certificate-center.verisign.dk");
a("trust-center.verisign.dk");
a("www.verisign.dk");
a("verisign.de");
a("knowledge.verisign.de");
a("ssl-certificate-center.verisign.de");
a("trust-center.verisign.de");
a("www.verisign.de");
a("verisign.es");
a("knowledge.verisign.es");
a("ssl-certificate-center.verisign.es");
a("trust-center.verisign.es");
a("www.verisign.es");
a("verisign.fr");
a("knowledge.verisign.fr");
a("ssl-certificate-center.verisign.fr");
a("trust-center.verisign.fr");
a("www.verisign.fr");
a("verisign.it");
a("ssl-certificate-center.verisign.it");
a("trust-center.verisign.it");
a("www.verisign.it");
a("verisign.nl");
a("www.verisign.nl");
a("verisign.se");
a("knowledge.verisign.se");
a("ssl-certificate-center.verisign.se");
a("trust-center.verisign.se");
a("www.verisign.se");
a("knowledge.verisign-grs.com");
a("verisigninc.com");
a("www.verisigninc.com");
a("verisign-japan-domain.com");
a("www.verisign-japan-domain.com");
a("verisignlabs.com");
a("pip.verisignlabs.com");
a("www.verisignlabs.com");

R = new RuleSet("Symbian Foundation");
R.rules.push(new Rule("^http://developer\\.symbian\\.org/", "https://developer.symbian.org/"));
a("developer.symbian.org");

R = new RuleSet("symlynX");
R.rules.push(new Rule("^http://(extra\\.|(?:www\\.))?symlynx\\.com/", "https://$1symlynx.com/"));
a("symlynx.com");
a("*.symlynx.com");

R = new RuleSet("System76.com");
R.rules.push(new Rule("^http://www\\.system76\\.com/", "https://www.system76.com/"));
R.rules.push(new Rule("^http://system76\\.com/", "https://www.system76.com/"));
a("www.system76.com");
a("system76.com");

R = new RuleSet("Systembolaget.se");
R.rules.push(new Rule("^http://systembolaget\\.se/", "https://www.systembolaget.se/"));
R.rules.push(new Rule("^http://www\\.systembolaget\\.se/", "https://www.systembolaget.se/"));
R.exclusions.push(new Exclusion("^http://www\\.systembolaget\\.se/Butik\\-\\-Ombud/"));
a("systembolaget.se");
a("www.systembolaget.se");

R = new RuleSet("Tmobile");
R.rules.push(new Rule("^http://(?:www\\.)?t-mobile\\.(com|nl)/", "https://www.t-mobile.$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?tmobile\\.(com|nl)/", "https://www.tmobile.$1/"));
R.rules.push(new Rule("^http://my\\.t-?mobile\\.com/", "https://my.t-mobile.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?t-mobile\\.co\\.uk/", "https://www.t-mobile.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?tmobileuk\\.blackberry\\.com/", "https://tmobileuk.blackberry.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?instantemail\\.t-mobile\\.co\\.uk/", "https://tmobileuk.blackberry.com/"));
R.rules.push(new Rule("^http://gsm\\.t-mobile\\.nl/", "https://gsm.t-mobile.nl/"));
a("t-mobile.com");
a("www.t-mobile.com");
a("my.t-mobile.com");
a("tmobile.com");
a("www.tmobile.com");
a("my.tmobile.com");
a("t-mobile.co.uk");
a("www.t-mobile.co.uk");
a("instantemail.t-mobile.co.uk");
a("www.instantemail.t-mobile.co.uk");
a("tmobileuk.blackberry.com");
a("www.tmobileuk.blackberry.com");
a("t-mobile.nl");
a("www.t-mobile.nl");
a("www.tmobile.nl");
a("tmobile.nl");
a("gsm.t-mobile.nl");

R = new RuleSet("TAZ");
R.rules.push(new Rule("^http://(?:www\\.)?taz\\.de/", "https://www.taz.de/"));
R.rules.push(new Rule("^http://blogs\\.taz\\.de/", "https://blogs.taz.de/"));
R.rules.push(new Rule("^http://dl\\.taz\\.de/", "https://dl.taz.de/"));
a("taz.de");
a("blogs.taz.de");
a("dl.taz.de");
a("www.taz.de");

R = new RuleSet("TD Bank (partial)");
R.rules.push(new Rule("^http://onlinebanking\\.tdbank\\.com/", "https://onlinebanking.tdbank.com/"));
a("onlinebanking.tdbank.com");

R = new RuleSet("TD Canada Trust");
R.rules.push(new Rule("^http://(?:www\\.)?tdcanadatrust\\.com/", "https://www.tdcanadatrust.com/"));
a("tdcanadatrust.com");
a("www.tdcanadatrust.com");

R = new RuleSet("TEAC (partial)");
R.rules.push(new Rule("^http://(www\\.)?teac\\.co\\.jp/", "https://teac.co.jp/"));
R.rules.push(new Rule("^http://shop\\.teac\\.com/", "https://shop.teac.com/"));
a("teac.co.jp");
a("www.teac.co.jp");
a("shop.teac.com");

R = new RuleSet("TED (partial)");
R.rules.push(new Rule("^http://(?:images\\.|www\\.)?ted\\.com/", "https://www.ted.com/"));
a("ted.com");
a("*.ted.com");

R = new RuleSet("TPG Capital (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?bergdorfgoodman\\.com/", "https://www.bergdorfgoodman.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?cusp\\.com/(content/|images/|stylesheets/)", "https://www.cusp.com/$1"));
R.rules.push(new Rule("^http://jscss\\.cp\\.ctscdn\\.com/", "https://www.cusp.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?incircle\\.com/", "https://www.incircle.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?lastcall\\.com/", "https://www.lastcall.com/"));
R.rules.push(new Rule("^http://neimanmarcus\\.com/", "https://www.neimanmarcus.com/"));
R.rules.push(new Rule("^http://(registry|www)\\.neimanmarcus\\.com/", "https://$1.neimanmarcus.com/"));
a("bergdorfgoodman.com");
a("www.bergdorfgoodman.com");
a("jscss.cp.ctscdn.com");
a("cusp.com");
a("www.cusp.com");
a("incircle.com");
a("www.incircle.com");
a("lastcall.com");
a("www.lastcall.com");
a("neimanmarcus.com");
a("*.neimanmarcus.com");

R = new RuleSet("TRUSTe (partial)");
R.rules.push(new Rule("^http://(clicktoverify|connect|feedback-form|login|preferences-mgr|privacy(-policy)?|tdp-feedback)\\.truste\\.com/", "https://$1.truste.com/"));
R.exclusions.push(new Exclusion("^http://www\\."));
a("*.truste.com");

R = new RuleSet("TT.se");
R.rules.push(new Rule("^http://tt\\.se/", "https://www.tt.se/"));
R.rules.push(new Rule("^http://www\\.tt\\.se/", "https://www.tt.se/"));
a("tt.se");
a("www.tt.se");

R = new RuleSet("TU I TAM");
R.rules.push(new Rule("^http://(www\\.)?tuitam\\.pl/", "https://$1tuitam.pl/"));
a("tuitam.pl");
a("www.tuitam.pl");

R = new RuleSet("TV4play.se");
R.rules.push(new Rule("^http://www\\.tv4play\\.se/", "https://www.tv4play.se/"));
R.rules.push(new Rule("^http://tv4play\\.se/", "https://www.tv4play.se/"));
a("tv4play.se");
a("www.tv4play.se");

R = new RuleSet("TYPO3");
R.rules.push(new Rule("^http://(www\\.)?typo3\\.org/", "https://typo3.org/"));
a("typo3.org");
a("www.typo3.org");

R = new RuleSet("Tahoe-LAFS");
R.rules.push(new Rule("^http://(www\\.)?tahoe-lafs\\.org/", "https://tahoe-lafs.org/"));
a("tahoe-lafs.org");
a("www.tahoe-lafs.org");

R = new RuleSet("Tailor Made Answers");
R.rules.push(new Rule("^http://(?:www\\.)?tailormadeanswers\\.com/", "https://tailormadeanswers.com/"));
a("tailormadeanswers.com");
a("www.tailormadeanswers.com");

R = new RuleSet("Taleo (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?taleo\\.(?:com|net)/", "https://www.taleo.com/"));
R.rules.push(new Rule("^http://(staticiad\\.)?tbe\\.taleo\\.net/", "https://$1tbe.taleo.net/"));
R.rules.push(new Rule("^http://(?:www\\.)?taleobusinessedition\\.com/", "https://www.taleo.com/solutions/taleo-business-edition"));
a("taleo.com");
a("*.taleo.com");
a("taleo.net");
a("*.taleo.net");
a("staticiad.tbe.taleo.net");

R = new RuleSet("TalkTalk (partial)");
R.rules.push(new Rule("^http://secure\\.nildram\\.net/", "https://secure.nildram.net/"));
R.rules.push(new Rule("^https://(?:www\\.)?t(?:alktalk|iscali)\\.co\\.uk/", "https://www.talktalk.co.uk/"));
R.rules.push(new Rule("^http://(help|myaccount|sales|sso)\\.talktalk\\.co\\.uk/", "https://$1.talktalk.co.uk/"));
R.rules.push(new Rule("^http://billing\\.mytalktalkbusiness\\.co\\.uk/", "https://billing.mytalktalkbusiness.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?talktalkbusiness\\.co\\.uk/(Global/|[tT]emplates/)", "https://www.talktalkbusiness.co.uk/$1"));
R.rules.push(new Rule("^http://media\\.tiscali\\.co\\.uk/", "https://media.tiscali.co.uk/"));
R.rules.push(new Rule("^http://m(\\d)\\.ttxm\\.co\\.uk/", "https://m$1.ttxm.co.uk/"));
a("secure.nildram.net");
a("talktalk.co.uk");
a("*.talktalk.co.uk");
a("talktalkbusiness.co.uk");
a("*.talktalkbusiness.co.uk");
a("*.ttxm.co.uk");
a("tiscali.co.uk");
a("*.tiscali.co.uk");

R = new RuleSet("Tandlakarforbundet.se");
R.rules.push(new Rule("^http://tandlakarforbundet\\.se/", "https://www.tandlakarforbundet.se/"));
R.rules.push(new Rule("^http://www\\.tandlakarforbundet\\.se/", "https://www.tandlakarforbundet.se/"));
a("tandlakarforbundet.se");
a("www.tandlakarforbundet.se");

R = new RuleSet("Tarsnap");
R.rules.push(new Rule("^http://(www\\.)?tarsnap\\.com/", "https://www.tarsnap.com/"));
a("tarsnap.com");
a("www.tarsnap.com");

R = new RuleSet("TataSky");
R.rules.push(new Rule("^http://www\\.mytatasky\\.com/", "https://www.mytatasky.com/"));
a("www.mytatasky.com");

R = new RuleSet("Tchibo.de");
R.rules.push(new Rule("^http://(?:www\\.)?tchibo\\.de/", "https://www.tchibo.de/"));
R.rules.push(new Rule("^http://tchibo\\.de/", "https://www.tchibo.de/"));
R.rules.push(new Rule("^http://media1\\.tchibo-content\\.de/", "https://media1.tchibo-content.de/"));
R.rules.push(new Rule("^http://media2\\.tchibo-content\\.de/", "https://media2.tchibo-content.de/"));
R.rules.push(new Rule("^http://media3\\.tchibo-content\\.de/", "https://media3.tchibo-content.de/"));
R.rules.push(new Rule("^http://media4\\.tchibo-content\\.de/", "https://media4.tchibo-content.de/"));
R.rules.push(new Rule("^http://media5\\.tchibo-content\\.de/", "https://media5.tchibo-content.de/"));
R.rules.push(new Rule("^http://media6\\.tchibo-content\\.de/", "https://media6.tchibo-content.de/"));
R.rules.push(new Rule("^http://media7\\.tchibo-content\\.de/", "https://media7.tchibo-content.de/"));
R.rules.push(new Rule("^http://media8\\.tchibo-content\\.de/", "https://media8.tchibo-content.de/"));
R.rules.push(new Rule("^http://media9\\.tchibo-content\\.de/", "https://media9.tchibo-content.de/"));
a("tchibo.de");
a("*.tchibo.de");
a("*.tchibo-content.de");

R = new RuleSet("TeX Users Group");
R.rules.push(new Rule("^http://(www\\.)?tug\\.org/", "https://www.tug.org/"));
a("tug.org");
a("www.tug.org");

R = new RuleSet("TeamCymru");
R.rules.push(new Rule("^http://team-cymru\\.org/", "https://team-cymru.org/"));
R.rules.push(new Rule("^http://(www)\\.team-cymru\\.org/", "https://$1.team-cymru.org/"));
a("team-cymru.org");
a("www.team-cymru.org");

R = new RuleSet("Teamviewer");
R.rules.push(new Rule("^http://((downloadeu1|login|wa103|wa236|www)\\.)?teamviewer\\.com/", "https://$1teamviewer.com/"));
a("teamviewer.com");
a("*.teamviewer.com");

R = new RuleSet("TechHouse");
R.rules.push(new Rule("^http://techhouse\\.org/", "https://techhouse.org/"));
R.rules.push(new Rule("^http://(www)\\.techhouse\\.org/", "https://$1.techhouse.org/"));
a("techhouse.org");
a("www.techhouse.org");

R = new RuleSet("TechTarget (partial)");
R.rules.push(new Rule("^http://media\\.techtarget\\.com/", "https://media.techtarget.com/"));
a("media.techtarget.com");

R = new RuleSet("TechWeb (partial)");
R.rules.push(new Rule("^http://i\\.techweb\\.com/", "https://i.techweb.com/"));
R.rules.push(new Rule("^http://(www\\.)?gamasutra\\.com/(blogs/edit/img/|(comments/|content/blogs/)?\\w+\\.css|(db_area/)?images/)", "https://$1gamasutra.com/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?techwebonlineevents\\.com/", "https://www.techwebonlineevents.com/"));
R.rules.push(new Rule("^http://twimgs\\.com/", "https://twimgs.com/"));
a("gamasutra.com");
a("www.gamasutra.com");
a("i.techweb.com");
a("techwebonlineevents.com");
a("*.techwebonlineevents.com");
a("twimgs.com");

R = new RuleSet("Technet.com");
R.rules.push(new Rule("^http://blogs\\.technet\\.com/", "https://blogs.technet.com/"));
a("blogs.technet.com");

R = new RuleSet("Technical University of Denmark (partial)");
R.rules.push(new Rule("^http://(((?:www\\.)?(alumne|dtic|portalen|space)|backend\\.alumnenet|auth|nemid|mail\\.win|www)\\.)?dtu\\.dk/", "https://$1dtu.dk/"));
a("dtu.dk");
a("alumne.dtu.dk");
a("www.alumne.dtu.dk");
a("backend.alumnenet.dtu.dk");
a("auth.dtu.dk");
a("dtic.dtu.dk");
a("www.dtic.dtu.dk");
a("nemid.dtu.dk");
a("portalen.dtu.dk");
a("www.portalen.dtu.dk");
a("space.dtu.dk");
a("www.space.dtu.dk");
a("mail.win.dtu.dk");
a("www.dtu.dk");

R = new RuleSet("Technical University of Lisbon");
R.rules.push(new Rule("^http://(www\\.)?(ist\\.|rnl\\.ist\\.)?utl\\.pt/", "https://www.$2utl.pt/"));
R.rules.push(new Rule("^http://ftp\\.rnl\\.ist\\.utl\\.pt/", "https://ftp.rnl.ist.utl.pt/"));
a("utl.pt");
a("ist.utl.pt");
a("rnl.ist.utl.pt");
a("ftp.rnl.ist.utl.pt");
a("www.rnl.ist.utl.pt");
a("www.ist.utl.pt");
a("www.utl.pt");

R = new RuleSet("Techniker Krankenkasse");
R.rules.push(new Rule("^http://(?:www\\.)?tk\\.de/", "https://www.tk.de/"));
a("www.tk.de");
a("tk.de");

R = new RuleSet("TechnologyReview");
R.rules.push(new Rule("^http://(?:www\\.)?technologyreview\\.com/", "https://www.technologyreview.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?technologyreview\\.in/", "https://www.technologyreview.in/"));
R.rules.push(new Rule("^http://s?metrics\\.technologyreview\\.com/", "https://smetrics.technologyreview.com/"));
R.rules.push(new Rule("^http://subscribe\\.technologyreview\\.com/", "https://subscribe.technologyreview.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?technologyreview\\.com/tr35/"));
a("technologyreview.com");
a("technologyreview.in");
a("*.technologyreview.com");
a("www.technologyreview.in");

R = new RuleSet("Techsupportalert");
R.rules.push(new Rule("^http://(?:www\\.)?techsupportalert\\.com/", "https://www.techsupportalert.com/"));
a("www.techsupportalert.com");
a("techsupportalert.com");

R = new RuleSet("Tehconnection");
R.rules.push(new Rule("^http://(static\\.|(?:www\\.))?tehconnection\\.eu/", "https://$1tehconnection.eu/"));
a("tehconnection.eu");
a("*.tehconnection.eu");

R = new RuleSet("Tele2.se");
R.rules.push(new Rule("^http://www\\.tele2\\.se/", "https://www.tele2.se/"));
R.rules.push(new Rule("^http://tele2\\.se/", "https://www.tele2.se/"));
a("www.tele2.se");
a("tele2.se");

R = new RuleSet("Telefónica (partial)");
R.rules.push(new Rule("^http://bethere\\.co\\.uk/", "https://www.bethere.co.uk/"));
R.rules.push(new Rule("^http://(avatar|help|www)\\.bethere\\.co\\.uk/", "https://$1.bethere.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?(chcidoo2|telefonica)\\.cz/", "https://www.$1.cz/"));
R.rules.push(new Rule("^http://windows\\.mouselike\\.org/", "https://windows.mouselike.org/"));
R.rules.push(new Rule("^http://(?:(www\\.)?cz\\.o2\\.com|o2\\.cz)/", "https://www.o2.cz/"));
R.rules.push(new Rule("^http://(moje|www)\\.o2\\.cz/", "https://$1.o2.cz/"));
R.rules.push(new Rule("^http://(i|mail)\\.o2active\\.cz/", "https://$1.o2active.cz/"));
R.rules.push(new Rule("^http://(?:www\\.)?o2(extra|shop|(?:-)?tv)\\.cz/", "https://www.o2$1.cz/"));
R.rules.push(new Rule("^http://(www\\.)?odmenazadobiti\\.cz/", "https://$1odmenazadobiti.cz/"));
R.rules.push(new Rule("^http://(?:www\\.)?o2online\\.de/", "https://www.o2online.de/"));
R.rules.push(new Rule("^http://(?:www\\.)?o2\\.co\\.uk/favicon\\.ico", "https://www.o2.co.uk/favicon.ico"));
a("chcidoo2.cz");
a("www.chcidoo2.cz");
a("cz.o2.com");
a("www.cz.o2.com");
a("o2.cz");
a("*.o2.cz");
a("*.www.o2.cz");
a("i.o2active.cz");
a("mail.o2active.cz");
a("o2extra.cz");
a("www.o2extra.cz");
a("o2shop.cz");
a("www.o2shop.cz");
a("o2tv.cz");
a("www.o2tv.cz");
a("o2-tv.cz");
a("www.o2-tv.cz");
a("odmenazadobiti.cz");
a("www.odmenazadobiti.cz");
a("telefonica.cz");
a("www.telefonica.cz");
a("o2online.de");
a("*.o2online.de");
a("bethere.co.uk");
a("*.bethere.co.uk");
a("windows.mouselike.org");
a("o2.co.uk");
a("www.o2.co.uk");

R = new RuleSet("Telegraph (mismatches)");
R.rules.push(new Rule("^http://fashionshop\\.telegraph\\.co\\.uk/", "https://fashionshop.telegraph.co.uk/"));
a("fashionshop.telegraph.co.uk");

R = new RuleSet("Telegraph Media Group (partial)");
R.rules.push(new Rule("^http://(announcements|jobs)\\.telegraph\\.co\\.uk/", "https://$1.telegraph.co.uk/"));
R.rules.push(new Rule("^http://fantasycricket\\.telegraph\\.co\\.uk/((county/|home/)?images/|favicon\\.ico$)", "https://fantasycricket.telegraph.co.uk/$1"));
R.rules.push(new Rule("^http://fantasyfootball\\.telegraph\\.co\\.uk/favicon\\.ico$", "https://fantasyfootball.telegraph.co.uk/favicon.ico"));
R.rules.push(new Rule("^http://i\\.fantasyfootball\\.telegraph\\.co\\.uk/", "https://gs1.edgecastcdn.net/00437A/telegraph/fantasyfootball/"));
R.exclusions.push(new Exclusion("^http://jobs\\.telegraph\\.co\\.uk/($|[^/]+\\.aspx)"));
a("telegraph.co.uk");
a("i.fantasyfootball.telegraph.co.uk");
a("*.telegraph.co.uk");

R = new RuleSet("Telfort");
R.rules.push(new Rule("^http://www\\.telfort\\.nl/", "https://www.telfort.nl/"));
a("www.telfort.nl");

R = new RuleSet("Telia.se");
R.rules.push(new Rule("^http://telia\\.se/", "https://www.telia.se/"));
R.rules.push(new Rule("^http://www\\.telia\\.se/", "https://www.telia.se/"));
a("telia.se");
a("*.telia.se");

R = new RuleSet("Telstra Corporation (partial)");
R.rules.push(new Rule("^http://medrx\\.sensis\\.com\\.au/", "https://medrx.sensis.com.au/"));
R.rules.push(new Rule("^http://sockassist\\.com\\.au/", "https://sockassist.com.au/"));
a("medrx.sensis.com.au");
a("sockassist.com.au");

R = new RuleSet("Tangient (partial)");
R.rules.push(new Rule("^http://(?:c1|ssl)\\.wikicdn\\.com/", "https://ssl.wikicdn.com/"));
R.rules.push(new Rule("^http://(ssl\\.|www\\.)?wikispaces\\.com/", "https://$1wikispaces.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.wikispaces\\.com/([is]|stylesheet)/", "https://$1.wikispaces.com/$2/"));
a("*.wikicdn.com");
a("wikispaces.com");
a("*.wikispaces.com");

R = new RuleSet("Terra Galleria");
R.rules.push(new Rule("^http://(www\\.)?terragalleria\\.com/", "https://$1terragalleria.com/"));
a("terragalleria.com");
a("*.terragalleria.com");
a("*.www.terragalleria.com");

R = new RuleSet("terreActive");
R.rules.push(new Rule("^http://(www\\.)?terreactive\\.ch/", "https://www.terreactive.ch/"));
a("www.terreactive.ch");
a("terreactive.ch");

R = new RuleSet("Tesco");
R.rules.push(new Rule("^http://(?:www\\.)?tescocompare\\.com/", "https://www.tescocompare.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?tescofinance\\.com/", "https://www.tescobank.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?tescobank\\.com/", "https://www.tescobank.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?tescophoto\\.com/", "https://www.tescophoto.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?tescodiets\\.com/", "https://www.tescodiets.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?tescogetinvolved\\.com/", "https://www.tescogetinvolved.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?clothingattesco\\.com/", "https://www.clothingattesco.com/"));
R.rules.push(new Rule("^http://(secure|direct|phone-shop)\\.tesco\\.com/", "https://$1.tesco.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?tesco\\.com/books/", "https://secure.tesco.com/books/"));
R.rules.push(new Rule("^http://(?:www\\.)?tesco\\.com/groceries/", "https://secure.tesco.com/groceries/"));
R.rules.push(new Rule("^http://(?:www\\.)?tesco\\.com/whatsinstore/", "https://secure.tesco.com/whatsinstore/"));
a("tesco.com");
a("tescocompare.com");
a("tescofinance.com");
a("tescobank.com");
a("tescophoto.com");
a("tescodiets.com");
a("clothingattesco.com");
a("tescogetinvolved.com");
a("direct.tesco.com");
a("secure.tesco.com");
a("phone-shop.tesco.com");
a("www.tesco.com");
a("www.clothingattesco.com");
a("www.tescocompare.com");
a("www.tescofinance.com");
a("www.tescobank.com");
a("www.tescophoto.com");
a("www.tescodiets.com");
a("www.tescogetinvolved.com");

R = new RuleSet("Texas Association of Schoolboards");
R.rules.push(new Rule("^http://(?:www\\.)?tasb\\.org/", "https://www.tasb.org/"));
R.rules.push(new Rule("^http://store\\.tasb\\.org/", "https://store-84a5f.mybigcommerce.com/"));
a("tasb.org");
a("*.tasb.org");

R = new RuleSet("Thawte");
R.rules.push(new Rule("^http://(?:www\\.)?thawte\\.com/", "https://www.thawte.com/"));
a("www.thawte.com");
a("thawte.com");

R = new RuleSet("The Art Institutes (partial)");
R.rules.push(new Rule("^https?://artinstitutes\\.edu/", "https://www.artinstitutes.edu/"));
R.rules.push(new Rule("^http://www\\.artinstitutes\\.edu/([iI]mages/|[iI]ncludes/|javascript/|masters-degrees/(images|stylesheets)/|Multimedia|programs-info/form/|[sS]tylesheets/|WebResource\\.axd)", "https://www.artinstitutes.edu/$2/"));
R.rules.push(new Rule("^http://content\\.artinstitutes\\.edu/", "https://content.artinstitutes.edu/"));
a("artinstitutes.edu");
a("*.artinstitutes.edu");

R = new RuleSet("The Atom Group (partial)");
R.rules.push(new Rule("^http://mail\\.theatomgroup\\.com/", "https://mail.theatomgroup.com/"));
a("mail.theatomgroup.com");

R = new RuleSet("The Best Hosting");
R.rules.push(new Rule("^http://(www\\.)?the-best-hosting\\.net/", "https://$1the-best-hosting.net/"));
a("the-best-hosting.net");
a("www.the-best-hosting.net");

R = new RuleSet("The Cutest Site on the Block");
R.rules.push(new Rule("^http://(www\\.)?thecutestsiteontheblock\\.com/", "https://www.thecutestsiteontheblock.com/"));
a("thecutestsiteontheblock.com");
a("www.thecutestsiteontheblock.com");

R = new RuleSet("TheAA");
R.rules.push(new Rule("^http://(?:www\\.)?theaa\\.com/", "https://www.theaa.com/"));
a("theaa.com");
a("www.theaa.com");

R = new RuleSet("The Book Depository");
R.rules.push(new Rule("^http://bookdepository\\.co\\.uk/", "https://bookdepository.co.uk/"));
R.rules.push(new Rule("^http://(cache0|cache1|cache2|cache3|images|www)\\.bookdepository\\.co\\.uk/", "https://$1.bookdepository.co.uk/"));
a("bookdepository.co.uk");
a("www.bookdepository.co.uk");
a("images.bookdepository.co.uk");
a("cache0.bookdepository.co.uk");
a("cache1.bookdepository.co.uk");
a("cache2.bookdepository.co.uk");
a("cache3.bookdepository.co.uk");

R = new RuleSet("The Book People");
R.rules.push(new Rule("^http://(?:www\\.)?thebookpeople\\.co\\.uk/", "https://www.thebookpeople.co.uk/"));
R.rules.push(new Rule("^http://images\\.thebookpeople\\.co\\.uk/", "https://images.thebookpeople.co.uk/"));
a("thebookpeople.co.uk");
a("images.thebookpeople.co.uk");
a("www.thebookpeople.co.uk");

R = new RuleSet("The Church of Jesus Christ of Latter-day Saints");
R.rules.push(new Rule("^http://(?:www\\.)?lds\\.org/", "https://www.lds.org/"));
R.rules.push(new Rule("^http://(history|store|tech|institute|seminary)\\.lds\\.org/", "https://$1.lds.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?ldscdn\\.org/", "https://www.ldscdn.org/"));
R.rules.push(new Rule("^http://(edge|media)\\.ldscdn\\.org/", "https://$1.ldscdn.org/"));
R.exclusions.push(new Exclusion("^http://lds\\.org/ldsorg"));
a("history.lds.org");
a("store.lds.org");
a("tech.lds.org");
a("www.lds.org");
a("lds.org");
a("institute.lds.org");
a("seminary.lds.org");
a("edge.ldscdn.org");
a("media.ldscdn.org");
a("www.ldscdn.org");
a("ldscdn.org");

R = new RuleSet("The Document Foundation");
R.rules.push(new Rule("^http://(?:www\\.)?documentfoundation\\.org/", "https://www.documentfoundation.org/"));
R.rules.push(new Rule("^http://piwik\\.documentfoundation\\.org/", "https://piwik.documentfoundation.org/"));
a("documentfoundation.org");
a("piwik.documentfoundation.org");
a("www.documentfoundation.org");

R = new RuleSet("ThePermitStore.com");
R.rules.push(new Rule("^http://thepermitstore\\.com/", "https://thepermitstore.com/"));
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.thepermitstore\\.com/", "https://$1.thepermitstore.com/"));
a("thepermitstore.com");
a("*.thepermitstore.com");

R = new RuleSet("The Pirate Bay");
R.rules.push(new Rule("^https?://(?:www\\.)?thepiratebay\\.(?:org|se)/", "https://thepiratebay.se/"));
R.rules.push(new Rule("^http://(rss|static|torrents)\\.thepiratebay\\.(?:org|se)/", "https://$1.thepiratebay.se/"));
a("thepiratebay.org");
a("*.thepiratebay.org");
a("thepiratebay.se");
a("*.thepiratebay.se");

R = new RuleSet("The Privacy Blog");
R.rules.push(new Rule("^http://(?:www\\.)?theprivacyblog\\.com/", "https://www.theprivacyblog.com/"));
a("www.theprivacyblog.com");
a("theprivacyblog.com");

R = new RuleSet("TheResumator clients (partial)");
R.rules.push(new Rule("^http://jobs\\.urbandictionary\\.com/", "https://urbandictionary.theresumator.com/"));
a("jobs.urbandictionary.com");

R = new RuleSet("TheResumator.com (partial)");
R.rules.push(new Rule("^http://theresumator\\.com/", "https://www.theresumator.com/"));
R.rules.push(new Rule("^http://(app|www)\\.theresumator\\.com/", "https://$1.theresumator.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.theresumator\\.com/(css/|favicon\\.ico|img/)", "https://$1.theresumator.com/$2"));
R.exclusions.push(new Exclusion("^http://app\\.theresumator\\.com/cb/"));
R.exclusions.push(new Exclusion("^http://support\\.theresumator\\.com/support/"));
a("theresumator.com");
a("*.theresumator.com");

R = new RuleSet("TheTrainLine");
R.rules.push(new Rule("^http://(?:www\\.)?thetrainline\\.com/", "https://www.thetrainline.com/"));
a("thetrainline.com");
a("www.thetrainline.com");

R = new RuleSet("Thefind");
R.rules.push(new Rule("^http://(?:www\\.)?thefind\\.com/", "https://www.thefind.com/"));
a("www.thefind.com");
a("thefind.com");

R = new RuleSet("thephone.coop (partial)");
R.rules.push(new Rule("^http://(my|order)\\.thephone\\.coop/", "https://$1.thephone.coop/"));
R.rules.push(new Rule("^http://(www\\.)?thephone\\.coop/templates/phone_coop_about_us_subhub/images/((content|my_account)_top|Phone-No|TPC_logo)\\.png$", "https://order.thephone.coop/payment/images/$2.png"));
a("thephone.coop");
a("my.thephone.coop");
a("order.thephone.coop");
a("www.thephone.coop");

R = new RuleSet("ThinkGeek");
R.rules.push(new Rule("^http://(?:www\\.)?thinkgeek\\.com/", "https://www.thinkgeek.com/"));
a("thinkgeek.com");
a("*.thinkgeek.com");

R = new RuleSet("Third Door Media (partial)");
R.rules.push(new Rule("^http://www\\.searchengineland\\.com/", "https://www.searchengineland.com/"));
R.rules.push(new Rule("^http://searchengineland\\.com/figz/", "https://searchengineland.com/figz/"));
R.rules.push(new Rule("^http://(www\\.)?searchmarketing(expo|now)\\.com/", "https://$1searchmarketing(expo|now).com/"));
a("searchengineland.com");
a("www.searchengineland.com");
a("searchmarketingexpo.com");
a("www.searchmarketingexpo.com");
a("searchmarketingnow.com");
a("www.searchmarketingnow.com");

R = new RuleSet("This is my next");
R.rules.push(new Rule("^http://(?:www\\.)?thisismynext\\.com/", "https://thisismynext.com/"));
a("thisismynext.com");
a("www.thisismynext.com");

R = new RuleSet("ThisWebHost");
R.rules.push(new Rule("^http://(?:www\\.)?thiswebhost\\.com/", "https://www.thiswebhost.com/"));
a("thiswebhost.com");
a("www.thiswebhost.com");

R = new RuleSet("Thomas Cook");
R.rules.push(new Rule("^http://thomascook\\.com/", "https://thomascook.com/"));
R.rules.push(new Rule("^http://(book|ww3|ww7|www)\\.thomascook\\.com/", "https://$1.thomascook.com/"));
a("thomascook.com");
a("*.thomascook.com");

R = new RuleSet("Thomson Reuters clients");
R.rules.push(new Rule("^https?://ir\\.monster\\.com/", "https://phx.corporate-ir.net/"));
a("phx.corporate-ir.net");

R = new RuleSet("Thomson Reuters (partial)");
R.rules.push(new Rule("^http://myaccount\\.west\\.thomson\\.com/", "https://myaccount.west.thomson.com/"));
R.rules.push(new Rule("^http://newsandinsight\\.thomsonreuters\\.com/(favicon\\.ico$|UserSettings\\.aspx|Web/)", "https://newsandinsight.thomsonreuters.com/$1"));
R.rules.push(new Rule("^http://(onepass|(images\\.)?store)\\.westlaw\\.com/", "https://$1.westlaw.com/"));
a("*.west.thomson.com");
a("newsandinsight.thomsonreuters.com");
a("*.westlaw.com");
a("images.store.westlaw.com");

R = new RuleSet("ThreatPost");
R.rules.push(new Rule("^http://(?:www\\.)?threatpost\\.com/", "https://threatpost.com/"));
a("threatpost.com");
a("www.threatpost.com");

R = new RuleSet("Three");
R.rules.push(new Rule("^http://(?:www\\.)?three\\.ie/", "https://www.three.ie/"));
R.rules.push(new Rule("^http://threestore\\.three\\.co\\.uk/", "https://threestore.three.co.uk/"));
a("three.ie");
a("www.three.ie");
a("threestore.three.co.uk");

R = new RuleSet("Thumbshots (partial)");
R.rules.push(new Rule("^http://thumbshots\\.com/", "https://thumbshots.com/"));
R.rules.push(new Rule("^http://(www\\.)?thumbshots\\.(?:com|net)/(admin/|DesktopModules/|images/|[pP]ortals/|register\\.aspx|SecureLogin|Telerik\\.Web\\.UI\\.WebResource\\.axd)", "https://$1thumbshots.com/$2"));
R.rules.push(new Rule("^http://(www\\.)?thumbshots\\.org/", "https://$1thumbshots.com/"));
R.rules.push(new Rule("^http://open\\.thumbshots\\.(?:com|org)/", "https://open.thumbshots.com/"));
a("thumbshots.*");
a("*.thumbshots.com");
a("*.thumbshots.net");
a("*.thumbshots.org");

R = new RuleSet("Thunder Ranch");
R.rules.push(new Rule("^http://(?:www\\.)?thunderranchinc\\.com/", "https://www.thunderranchinc.com/"));
a("thunderranchinc.com");
a("www.thunderranchinc.com");

R = new RuleSet("TicketingNetworkEastMidlands");
R.rules.push(new Rule("^http://ticketingnetworkeastmidlands\\.co\\.uk/", "https://ticketingnetworkeastmidlands.co.uk/"));
R.rules.push(new Rule("^http://www\\.ticketingnetworkeastmidlands\\.co\\.uk/", "https://www.ticketingnetworkeastmidlands.co.uk/"));
R.rules.push(new Rule("^http://ticketing\\.trch\\.co\\.uk/", "https://ticketing.trch.co.uk/"));
a("ticketingnetworkeastmidlands.co.uk");
a("www.ticketingnetworkeastmidlands.co.uk");
a("ticketing.trch.co.uk");

R = new RuleSet("Tilera (partial)");
R.rules.push(new Rule("^http://support\\.tilera\\.com/", "https://support.tilera.com/"));
a("support.tilera.com");

R = new RuleSet("Timbro.se");
R.rules.push(new Rule("^http://www\\.timbro\\.se/", "https://www.timbro.se/"));
R.rules.push(new Rule("^http://timbro\\.se/", "https://timbro.se/"));
a("timbro.se");
a("www.timbro.se");

R = new RuleSet("TinEye (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?tineye\\.com/", "https://www.tineye.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?pixid\\.ideeinc\\.com/", "https://pixid.ideeinc.com/"));
a("www.tineye.com");
a("tineye.com");
a("pixid.ideeinc.com");

R = new RuleSet("TinyChat");
R.rules.push(new Rule("^http://(?:www\\.)?tinychat\\.com/", "https://tinychat.com/"));
a("tinychat.com");
a("www.tinychat.com");

R = new RuleSet("TinyURL");
R.rules.push(new Rule("^http://(?:www\\.)?tinyurl\\.com/", "https://tinyurl.com/"));
a("tinyurl.com");
a("*.tinyurl.com");

R = new RuleSet("Tirerack");
R.rules.push(new Rule("^http://(www\\.)?tirerack\\.com/", "https://www.tirerack.com/"));
a("www.tirerack.com");
a("tirerack.com");

R = new RuleSet("Tmcnet.com");
R.rules.push(new Rule("^http://www\\.tmcnet\\.com/", "https://www.tmcnet.com/"));
R.rules.push(new Rule("^http://tmcnet\\.com/", "https://tmcnet.com/"));
a("www.tmcnet.com");
a("tmcnet.com");

R = new RuleSet("Todoist");
R.rules.push(new Rule("^http://(?:www\\.)?todoist\\.com/", "https://todoist.com/"));
a("todoist.com");

R = new RuleSet("TodoLy");
R.rules.push(new Rule("^http://(?:www\\.)?todo\\.ly/", "https://todo.ly/"));
a("todo.ly");
a("www.todo.ly");

R = new RuleSet("TofinoSecurity");
R.rules.push(new Rule("^http://(?:www\\.)?tofinosecurity\\.com/", "https://www.tofinosecurity.com/"));
a("www.tofinosecurity.com");
a("tofinosecurity.com");

R = new RuleSet("Tokyo Toshokan");
R.rules.push(new Rule("^http://(?:www\\.)?tokyotosho\\.info/", "https://www.tokyotosho.info/"));
R.rules.push(new Rule("^http://(?:www\\.)?tokyotosho\\.se/", "https://www.tokyotosho.info/"));
R.rules.push(new Rule("^http://(?:www\\.)?tokyo-tosho\\.net/", "https://www.tokyotosho.info/"));
a("tokyotosho.info");
a("www.tokyotosho.info");
a("tokyotosho.se");
a("www.tokyotosho.se");
a("tokyo-tosho.net");
a("www.tokyo-tosho.net");

R = new RuleSet("TomTom International (partial)");
R.rules.push(new Rule("^http://(www\\.)?tomtom\\.com/(\\w+)/", "https://$1tomtom.com/$2/"));
R.rules.push(new Rule("^http://business\\.tomtom\\.com/", "https://business.tomtom.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?tomtom\\.com/(products|support)/"));
a("tomtom.com");
a("business.tomtom.com");
a("www.tomtom.com");

R = new RuleSet("Tompkins-Cortland Community College");
R.rules.push(new Rule("^http://(www\\.)?tc3\\.edu/", "https://tc3.edu/"));
a("www.tc3.edu");
a("tc3.edu");

R = new RuleSet("Tom's of Maine (partial)");
R.rules.push(new Rule("^http://images\\.tomsofmainestore\\.com/", "https://images.tomsofmainestore.com/"));
R.rules.push(new Rule("^http://(www\\.)?tomsofmainestore\\.com/webstore/(a4j/|login\\.do)", "https://www.tomsofmainestore.com/webstore/$2"));
a("tomsofmainestore.com");
a("images.tomsofmainestore.com");
a("www.tomsofmainestore.com");

R = new RuleSet("Toolserver");
R.rules.push(new Rule("^http://(?:www\\.)?toolserver\\.org/", "https://toolserver.org/"));
R.rules.push(new Rule("^http://(fingerprints|fisheye|jira|journal|svn|wiki)\\.toolserver\\.org/", "https://$1.toolserver.org/"));
a("toolserver.org");
a("*.toolserver.org");

R = new RuleSet("toonpool.com (partial)");
R.rules.push(new Rule("^http://shop\\.toonpool\\.com/", "https://shop.toonpool.com/"));
a("shop.toonpool.com");

R = new RuleSet("TopCoder");
R.rules.push(new Rule("^http://([\\w\\-]+\\.)?topcoder\\.com/", "https://$1topcoder.com/"));
a("topcoder.com");
a("*.topcoder.com");

R = new RuleSet("Tor2Web");
R.rules.push(new Rule("^http://([^/]+)\\.tor2web\\.(org|com)/", "https://$1.tor2web.org/"));
R.rules.push(new Rule("^https://([^/]+)\\.tor2web\\.com/", "https://$1.tor2web.org/"));
a("*.tor2web.com");
a("*.tor2web.org");

R = new RuleSet("Tor Project");
R.rules.push(new Rule("^http://torproject\\.org/", "https://torproject.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.torproject\\.org/", "https://$1.torproject.org/"));
R.exclusions.push(new Exclusion("^http://archive\\.torproject\\.org/"));
R.exclusions.push(new Exclusion("^http://media\\.torproject\\.org/"));
R.exclusions.push(new Exclusion("^http://deb\\.torproject\\.org/"));
R.exclusions.push(new Exclusion("^http://torperf\\.torproject\\.org/"));
a("torproject.org");
a("*.torproject.org");

R = new RuleSet("TorrentFreak.com");
R.rules.push(new Rule("^http://www\\.torrentfreak\\.com/", "https://www.torrentfreak.com/"));
R.rules.push(new Rule("^http://torrentfreak\\.com/", "https://www.torrentfreak.com/"));
a("torrentfreak.com");
a("www.torrentfreak.com");

R = new RuleSet("TorrentPrivacy (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?torrentprivacy\\.com/", "https://torrentprivacy.com/"));
a("torrentprivacy.com");
a("www.torrentprivacy.com");

R = new RuleSet("Torrentz");
R.rules.push(new Rule("^https?://(?:www\\.)?torrentz\\.(?:com|me)/", "https://torrentz.eu/"));
R.rules.push(new Rule("^http://(?:www\\.)?torrentz\\.eu/", "https://torrentz.eu/"));
a("www.torrentz.com");
a("www.torrentz.eu");
a("www.torrentz.me");
a("torrentz.com");
a("torrentz.eu");
a("torrentz.me");

R = new RuleSet("Torservers");
R.rules.push(new Rule("^http://(?:www\\.)?torservers\\.net/", "https://www.torservers.net/"));
a("www.torservers.net");
a("torservers.net");

R = new RuleSet("Totem");
R.rules.push(new Rule("^http://totemapp\\.com/", "https://www.totemapp.com/"));
R.rules.push(new Rule("^http://(totem|www)\\.totemapp\\.com/", "https://$1.totemapp.com/"));
a("totemapp.com");
a("*.totemapp.com");

R = new RuleSet("Tradera");
R.rules.push(new Rule("^http://tradera\\.se/", "https://www.tradera.com/"));
R.rules.push(new Rule("^http://www\\.tradera\\.se/", "https://www.tradera.com/"));
R.rules.push(new Rule("^http://tradera\\.com/", "https://www.tradera.com/"));
R.rules.push(new Rule("^http://www\\.tradera\\.com/", "https://www.tradera.com/"));
a("tradera.com");
a("*.tradera.com");
a("tradera.se");
a("*.tradera.se");

R = new RuleSet("Trafficfacts.com");
R.rules.push(new Rule("^http://rt\\.trafficfacts\\.com/", "https://rt.trafficfacts.com/"));
a("rt.trafficfacts.com");

R = new RuleSet("Transifex.net");
R.rules.push(new Rule("^http://(?:www\\.)?transifex\\.net/", "https://www.transifex.net/"));
a("transifex.net");
a("www.transifex.net");

R = new RuleSet("TransitionNetwork.org");
R.rules.push(new Rule("^http://(www\\.)?transitionnetwork\\.org/", "https://www.transitionnetwork.org/"));
a("transitionnetwork.org");
a("www.transitionnetwork.org");

R = new RuleSet("Translatewiki.net");
R.rules.push(new Rule("^http://(?:www\\.)?translatewiki\\.net/", "https://translatewiki.net/"));
a("translatewiki.net");
a("www.translatewiki.net");

R = new RuleSet("Transmode");
R.rules.push(new Rule("^http://(www\\.)?transmode\\.com/", "https://$1transmode.com/"));
a("transmode.com");
a("www.transmode.com");

R = new RuleSet("Transportstyrelsen.se");
R.rules.push(new Rule("^http://www\\.transportstyrelsen\\.se/", "https://www.transportstyrelsen.se/"));
R.rules.push(new Rule("^http://transportstyrelsen\\.se/", "https://transportstyrelsen.se/"));
a("transportstyrelsen.se");
a("www.transportstyrelsen.se");

R = new RuleSet("Trashmail");
R.rules.push(new Rule("^http://(?:www\\.)?trashmail\\.net/", "https://ssl.trashmail.net/"));
a("trashmail.net");
a("www.trashmail.net");

R = new RuleSet("TreasuryDirect");
R.rules.push(new Rule("^http://(?:www\\.)?treasurydirect\\.gov/", "https://www.treasurydirect.gov/"));
a("treasurydirect.gov");
a("www.treasurydirect.gov");

R = new RuleSet("TrialPay");
R.rules.push(new Rule("^http://(?:www\\.)?trialpay\\.com/", "https://www.trialpay.com/"));
R.rules.push(new Rule("^http://assets\\.trialpay\\.com/", "https://d2n8p8eh14pae1.cloudfront.net/"));
a("trialpay.com");
a("*.trialpay.com");

R = new RuleSet("Tribune (partial)");
R.rules.push(new Rule("^http://advertise\\.courant\\.com/", "https://advertise.courant.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?courant\\.com/includes/uploads/2010/08/3A2C26D5_courant_logo_981x160b\\.jpg$", "https://advertise.courant.com/portal/page/portal/Hartford%20Courant/Content%20Items/P2P/3A2C26D5_courant_logo_981x160b.jpg"));
R.rules.push(new Rule("^http://(?:www\\.)?courant\\.com/media/graphic/2009-06/47547079\\.png$", "https://advertise.courant.com/portal/page/portal/Hartford%20Courant/Content%20Items/P2P/47547079.png"));
a("courant.com");
a("*.courant.com");

R = new RuleSet("Trisquel");
R.rules.push(new Rule("^http://(?:www\\.)?trisquel\\.info/", "https://trisquel.info/"));
a("trisquel.info");
a("www.trisquel.info");

R = new RuleSet("Truecrypt (partial)");
R.rules.push(new Rule("^http://(www\\.)?truecrypt\\.org/(bug|donation|image)s/", "https://$1truecrypt.org/$1s/"));
R.rules.push(new Rule("^http://forums\\.truecrypt\\.org/templates/", "https://forums.truecrypt.org/templates/"));
a("truecrypt.org");
a("*.truecrypt.org");

R = new RuleSet("Trustico");
R.rules.push(new Rule("^http://(?:www\\.)?trustico\\.com/", "https://www.trustico.com/"));
a("www.trustico.com");
a("trustico.com");

R = new RuleSet("Trustwave (partial)");
R.rules.push(new Rule("^http://((www|sealserver|ssl)\\.)?trustwave\\.com/", "https://$1trustwave.com/"));
a("trustwave.com");
a("*.trustwave.com");

R = new RuleSet("Trustworthy Internet Movement");
R.rules.push(new Rule("^http://(www\\.)?trustworthyinternet\\.org/", "https://$1trustworthyinternet.org/"));
a("trustworthyinternet.org");
a("www.trustworthyinternet.org");

R = new RuleSet("Truthdig.com");
R.rules.push(new Rule("^http://(www\\.)?truthdig\\.com/", "https://$1truthdig.com/"));
a("truthdig.com");
a("www.truthdig.com");

R = new RuleSet("Trygghansa.se");
R.rules.push(new Rule("^http://(www\\.)?trygghansa\\.se/", "https://www.trygghansa.se/"));
a("trygghansa.se");
a("www.trygghansa.se");

R = new RuleSet("Tucows (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?contactprivacy\\.com/", "https://rr-n1-tor.opensrs.net/wp_mailer/"));
R.rules.push(new Rule("^http://(?:www\\.)?hover\\.com/", "https://www.hover.com/"));
R.rules.push(new Rule("^http://(mail|support)\\.(hover|ispbilling)\\.com/", "https://$1.$2.com/"));
R.rules.push(new Rule("^http://(signup\\.)?(?:www\\.)?opensrs\\.(?:com|net)/", "https://$1opensrs.com/"));
R.rules.push(new Rule("^http://rr-n1-tor\\.opensrs\\.net/", "https://rr-n1-tor.opensrs.net/"));
R.rules.push(new Rule("^http://(help\\.)?(?:www\\.)?ting\\.com/", "https://$1ting.com/"));
R.exclusions.push(new Exclusion("^http://www\\.opensrs\\.com/blog[\\w/\\-]*/$"));
a("contact-privacy.com");
a("hover.com");
a("mail.hover.com");
a("www.hover.com");
a("support.ispbilling.com");
a("opensrs.com");
a("signup.opensrs.com");
a("www.opensrs.com");
a("opensrs.net");
a("rr-n1-tor.opensrs.net");
a("www.opensrs.net");
a("ting.com");
a("help.ting.com");
a("www.ting.com");

R = new RuleSet("Tumblr (partial)");
R.rules.push(new Rule("^http://(www\\.)?tumblr\\.com/($|login)", "https://$1tumblr.com/$2"));
R.rules.push(new Rule("^http://assets\\.tumblr\\.com/((images/)?iframe|javascript/tumblelog\\.js|swf/)", "https://secure.assets.tumblr.com/$1"));
R.rules.push(new Rule("^http://(assets|data|static)\\.tumblr\\.com/", "https://s3.amazonaws.com/$1.tumblr.com/"));
R.rules.push(new Rule("^http://secure\\.assets\\.tumblr\\.com/", "https://secure.assets.tumblr.com/"));
R.rules.push(new Rule("^http://(?:\\d+\\.)?media\\.tumblr\\.com/", "https://s3.amazonaws.com/data.tumblr.com/"));
a("tumblr.com");
a("*.tumblr.com");
a("secure.assets.tumblr.com");
a("*.media.tumblr.com");

R = new RuleSet("TunnelBear");
R.rules.push(new Rule("^http://(?:www\\.)?tunnelbear\\.com/", "https://www.tunnelbear.com/"));
a("www.Tunnelbear.com");
a("tunnelbear.com");

R = new RuleSet("Turn.com");
R.rules.push(new Rule("^http://r\\.turn\\.com/", "https://r.turn.com/"));
a("r.turn.com");

R = new RuleSet("Tweakers.net");
R.rules.push(new Rule("^http://(www\\.)?(gathering\\.|secure\\.)?tweakers\\.net/", "https://$2tweakers.net/"));
R.rules.push(new Rule("^http://(www\\.)?(ic\\.)?tweakimg\\.net/", "https://$2tweakimg.net/"));
a("tweakers.net");
a("gathering.tweakers.net");
a("secure.tweakers.net");
a("www.tweakers.net");
a("tweakimg.net");
a("ic.tweakimg.net");
a("www.tweakimg.net");

R = new RuleSet("Tweetdeck");
R.rules.push(new Rule("^http://(?:www\\.)?tweetdeck\\.com/", "https://www.tweetdeck.com/"));
R.exclusions.push(new Exclusion("^http://support\\.tweetdeck\\.com/"));
a("tweetdeck.com");
a("www.tweetdeck.com");

R = new RuleSet("Twisted4Life");
R.rules.push(new Rule("^http://((?:www\\.)?twisted4life\\.com)/", "https://$1/"));
a("twisted4life.com");
a("www.twisted4life.com");

R = new RuleSet("TwitPic");
R.rules.push(new Rule("^http://(?:www\\.)?twitpic\\.com/", "https://twitpic.com/"));
a("twitpic.com");
a("*.twitpic.com");

R = new RuleSet("Twitter");
R.rules.push(new Rule("^http://twitter\\.com/", "https://twitter.com/"));
R.rules.push(new Rule("^http://(?:de|en|es|fr|it|ja|jp|www)\\.twitter\\.com/", "https://twitter.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?twitter\\.jp/", "https://twitter.com/"));
R.rules.push(new Rule("^http://(api|business|dev|mobile|search|static|support)\\.twitter\\.com/", "https://$1.twitter.com/"));
R.rules.push(new Rule("^http://(p|si\\d)\\.twimg\\.com/", "https://$1.twimg.com/"));
R.rules.push(new Rule("^http://widgets\\.twimg\\.com/", "https://widgets.twimg.com/"));
R.rules.push(new Rule("^http://m\\.twitter\\.com/", "https://mobile.twitter.com/"));
R.rules.push(new Rule("^http://(?:a\\d|s)\\.twimg\\.com/", "https://si0.twimg.com/"));
R.rules.push(new Rule("^http://firefox\\.twitter\\.com/", "https://twitter.com/download/firefox/"));
R.rules.push(new Rule("^http://media\\.twitter\\.com/", "https://dev.twitter.com/media/"));
R.rules.push(new Rule("^http://(www\\.)?t\\.co/", "https://t.co/"));
R.rules.push(new Rule("^http://engineering\\.twitter\\.com/favicon\\.ico", "https://www.blogger.com/favicon.ico"));
a("*.twitter.com");
a("twitter.com");
a("www.twitter.jp");
a("twitter.jp");
a("*.twimg.com");
a("www.t.co");
a("t.co");

R = new RuleSet("U by Kotex Australia");
R.rules.push(new Rule("^http://(www\\.)?ubykotex\\.com\\.au/", "https://$1ubykotex.com.au/"));
a("ubykotex.com.au");
a("www.ubykotex.com.au");

R = new RuleSet("UCSD");
R.rules.push(new Rule("^http://aventeur\\.ucsd\\.edu/", "https://aventeur.ucsd.edu/"));
R.rules.push(new Rule("^http://a4\\.ucsd\\.edu/", "https://a4.ucsd.edu/"));
R.rules.push(new Rule("^http://acs-webmail\\.ucsd\\.edu/", "https://acs-webmail.ucsd.edu/"));
R.rules.push(new Rule("^http://altng\\.ucsd\\.edu/", "https://altng.ucsd.edu/"));
R.rules.push(new Rule("^http://cinfo\\.ucsd\\.edu/", "https://cinfo.ucsd.edu/"));
R.rules.push(new Rule("^http://facilities\\.ucsd\\.edu/", "https://facilities.ucsd.edu/"));
R.rules.push(new Rule("^http://graduateapp\\.ucsd\\.edu/", "https://graduateapp.ucsd.edu/"));
R.rules.push(new Rule("^http://myucsdchart\\.ucsd\\.edu/", "https://myucsdchart.ucsd.edu/"));
R.rules.push(new Rule("^http://sdacs\\.ucsd\\.edu/", "https://sdacs.ucsd.edu/"));
R.rules.push(new Rule("^http://shs\\.ucsd\\.edu/", "https://shs.ucsd.edu/"));
R.rules.push(new Rule("^http://acms\\.ucsd\\.edu/", "https://acms.ucsd.edu/"));
R.rules.push(new Rule("^http://roger\\.ucsd\\.edu/", "https://roger.ucsd.edu/"));
R.rules.push(new Rule("^http://www-cse\\.ucsd\\.edu/", "https://www-cse.ucsd.edu/"));
R.rules.push(new Rule("^http://hds\\.ucsd\\.edu/(ARCH_WaitList/ARCHMainMenu\\.aspx|conference/RequestInfo/|HospitalityExpress)", "https://hds.ucsd.edu/$1"));
R.rules.push(new Rule("^http://health\\.ucsd\\.edu/request_appt/", "https://health.ucsd.edu/request_appt/"));
R.rules.push(new Rule("^http://libraries\\.ucsd\\.edu/digital/", "https://libraries.ucsd.edu/digital/"));
R.rules.push(new Rule("^http://studenthealth\\.ucsd\\.edu/secure/", "https://studenthealth.ucsd.edu/secure/"));
R.rules.push(new Rule("^http://www-act\\.ucsd\\.edu/(bsl/home|cgi-bin/[A-Za-z]+link\\.pl|mytritonlink/view|myTritonlink20|student[A-Z][A-Za-z]+/[A-Za-z]+)", "https://www-act.ucsd.edu/$1"));
R.rules.push(new Rule("^http://accesslink\\.ucsd\\.edu/", "https://altng.ucsd.edu/"));
R.rules.push(new Rule("^http://financiallink\\.ucsd\\.edu/(.*)$", "https://www-act.ucsd.edu/cgi-bin/financiallink.pl"));
R.rules.push(new Rule("^http://(www\\.)?(my)?tritonlink\\.ucsd\\.edu/(.*)$", "https://www-act.ucsd.edu/myTritonlink20/display.htm"));
R.rules.push(new Rule("^http://uclearning\\.ucsd\\.edu/", "https://a4.ucsd.edu/lms/"));
R.rules.push(new Rule("^http://(cri|desktop|iwdc|resnet|software|sysstaff)\\.ucsd\\.edu/", "https://acms.ucsd.edu/units/$1/"));
R.rules.push(new Rule("^http://www-acs\\.ucsd\\.edu/$", "https://acms.ucsd.edu/index.shtml"));
R.rules.push(new Rule("^http://www-acs\\.ucsd\\.edu/account-tools/oce-intro\\.shtml$", "https://acms.ucsd.edu/students/oce-intro.shtml"));
R.rules.push(new Rule("^http://www-acs\\.ucsd\\.edu/instructional/?$", "https://acms.ucsd.edu/students/"));
a("aventeur.ucsd.edu");
a("a4.ucsd.edu");
a("acs-webmail.ucsd.edu");
a("altng.ucsd.edu");
a("cinfo.ucsd.edu");
a("facilities.ucsd.edu");
a("graduateapp.ucsd.edu");
a("myucsdchart.ucsd.edu");
a("sdacs.ucsd.edu");
a("shs.ucsd.edu");
a("acms.ucsd.edu");
a("roger.ucsd.edu");
a("www-cse.ucsd.edu");
a("hds.ucsd.edu");
a("health.ucsd.edu");
a("libraries.ucsd.edu");
a("studenthealth.ucsd.edu");
a("www-act.ucsd.edu");
a("accesslink.ucsd.edu");
a("cri.ucsd.edu");
a("desktop.ucsd.edu");
a("financiallink.ucsd.edu");
a("iwdc.ucsd.edu");
a("mytritonlink.ucsd.edu");
a("www.mytritonlink.ucsd.edu");
a("resnet.ucsd.edu");
a("software.ucsd.edu");
a("sysstaff.ucsd.edu");
a("tritonlink.ucsd.edu");
a("www.tritonlink.ucsd.edu");
a("uclearning.ucsd.edu");
a("www-acs.ucsd.edu");

R = new RuleSet("Unreal Development Kit");
R.rules.push(new Rule("^http://(?:www\\.)?udk\\.com/", "https://udk.com/"));
a("udk.com");
a("www.udk.com");

R = new RuleSet("UHH_Informatik");
R.rules.push(new Rule("^http://(?:www\\.)?informatik\\.uni-hamburg\\.de/", "https://www.informatik.uni-hamburg.de/"));
a("www.informatik.uni-hamburg.de");
a("informatik.uni-hamburg.de");

R = new RuleSet("UIE");
R.rules.push(new Rule("^http://(?:www\\.)?uie\\.com/", "https://www.uie.com/"));
a("uie.com");
a("www.uie.com");

R = new RuleSet("UK Free Software Network (partial)");
R.rules.push(new Rule("^http://(manage\\.|www\\.)?ukfsn\\.org/", "https://$1ukfsn.org/"));
a("ukfsn.org");
a("*.ukfsn.org");

R = new RuleSet("UK Information Commissioner's Office (partial)");
R.rules.push(new Rule("^http://ico\\.gov\\.uk/", "https://www.ico.gov.uk/"));
R.rules.push(new Rule("^http://www\\.ico\\.gov\\.uk/(favicon.ico|(\\w+/)?\\w+/~/|upload/)", "https://www.ico.gov.uk/$1"));
a("ico.gov.uk");
a("www.ico.gov.uk");

R = new RuleSet("UK Web Solutions Direct");
R.rules.push(new Rule("^http://(?:www\\.)?ukwebsolutionsdirect\\.co\\.uk/", "https://ukwebsolutionsdirect.co.uk/"));
a("ukwebsolutionsdirect.co.uk");
a("www.ukwebsolutionsdirect.co.uk");

R = new RuleSet("UK Local Government");
R.rules.push(new Rule("^http://(?:www\\.)?(hinckleyandbosworthonline\\.org\\.uk|hinckley\\-bosworth\\.gov\\.uk)/", "https://www.hinckley-bosworth.gov.uk/"));
R.rules.push(new Rule("^http://apps\\.southend\\.gov\\.uk/", "https://apps.southend.gov.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?(broadland\\.gov\\.uk|kettering\\.gov\\.uk|manchester\\.gov\\.uk|monmouthshire\\.gov\\.uk|northwarks\\.gov\\.uk)/", "https://secure.$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?([^/]+)/", "https://www.$1/"));
a("www.hinckleyandbosworthonline.org.uk");
a("hinckleyandbosworthonline.org.uk");
a("www.hinckley-bosworth.gov.uk");
a("hinckley-bosworth.gov.uk");
a("apps.southend.gov.uk");
a("broadland.gov.uk");
a("www.broadland.gov.uk");
a("manchester.gov.uk");
a("www.manchester.gov.uk");
a("monmouthshire.gov.uk");
a("www.monmouthshire.gov.uk");
a("northwarks.gov.uk");
a("www.northwarks.gov.uk");
a("aberdeencity.gov.uk");
a("www.aberdeencity.gov.uk");
a("aberdeenshire.gov.uk");
a("www.aberdeenshire.gov.uk");
a("angus.gov.uk");
a("www.angus.gov.uk");
a("bassetlaw.gov.uk");
a("www.bassetlaw.gov.uk");
a("bathnes.gov.uk");
a("www.bathnes.gov.uk");
a("blackpool.gov.uk");
a("www.blackpool.gov.uk");
a("bournemouth.gov.uk");
a("www.bournemouth.gov.uk");
a("bradford.gov.uk");
a("www.bradford.gov.uk");
a("braintree.gov.uk");
a("www.braintree.gov.uk");
a("brent.gov.uk");
a("www.brent.gov.uk");
a("burnley.gov.uk");
a("www.burnley.gov.uk");
a("calderdale.gov.uk");
a("www.calderdale.gov.uk");
a("camden.gov.uk");
a("www.camden.gov.uk");
a("canterbury.gov.uk");
a("www.canterbury.gov.uk");
a("ceredigion.gov.uk");
a("www.ceredigion.gov.uk");
a("charnwood.gov.uk");
a("www.charnwood.gov.uk");
a("cherwell.gov.uk");
a("www.cherwell.gov.uk");
a("cheshireeast.gov.uk");
a("www.cheshireeast.gov.uk");
a("cityoflondon.gov.uk");
a("www.cityoflondon.gov.uk");
a("derby.gov.uk");
a("www.derby.gov.uk");
a("devon.gov.uk");
a("www.devon.gov.uk");
a("doncaster.gov.uk");
a("www.doncaster.gov.uk");
a("dover.gov.uk");
a("www.dover.gov.uk");
a("dudley.gov.uk");
a("www.dudley.gov.uk");
a("dundeecity.gov.uk");
a("www.dundeecity.gov.uk");
a("easthants.gov.uk");
a("www.easthants.gov.uk");
a("eastlothian.gov.uk");
a("www.eastlothian.gov.uk");
a("east-northamptonshire.gov.uk");
a("www.east-northamptonshire.gov.uk");
a("eastriding.gov.uk");
a("www.eastriding.gov.uk");
a("edinburgh.gov.uk");
a("www.edinburgh.gov.uk");
a("elmbridge.gov.uk");
a("www.elmbridge.gov.uk");
a("enfield.gov.uk");
a("www.enfield.gov.uk");
a("essex.gov.uk");
a("www.essex.gov.uk");
a("falkirk.gov.uk");
a("www.falkirk.gov.uk");
a("fareham.gov.uk");
a("www.fareham.gov.uk");
a("fenland.gov.uk");
a("www.fenland.gov.uk");
a("fifedirect.org.uk");
a("www.fifedirect.org.uk");
a("fylde.gov.uk");
a("www.fylde.gov.uk");
a("gateshead.gov.uk");
a("www.gateshead.gov.uk");
a("glasgow.gov.uk");
a("www.glasgow.gov.uk");
a("gloucestershire.gov.uk");
a("www.gloucestershire.gov.uk");
a("hackney.gov.uk");
a("www.hackney.gov.uk");
a("hants.gov.uk");
a("www.hants.gov.uk");
a("hastings.gov.uk");
a("www.hastings.gov.uk");
a("herefordshire.gov.uk");
a("www.herefordshire.gov.uk");
a("hertsdirect.org");
a("www.hertsdirect.org");
a("hillingdon.gov.uk");
a("www.hillingdon.gov.uk");
a("ipswich.gov.uk");
a("www.ipswich.gov.uk");
a("islington.gov.uk");
a("www.islington.gov.uk");
a("iwight.com");
a("www.iwight.com");
a("kent.gov.uk");
a("www.kent.gov.uk");
a("kettering.gov.uk");
a("www.kettering.gov.uk");
a("kirklees.gov.uk");
a("www.kirklees.gov.uk");
a("lbhf.gov.uk");
a("www.lbhf.gov.uk");
a("leicestershire.gov.uk");
a("www.leicestershire.gov.uk");
a("lincolnshire.gov.uk");
a("www.lincolnshire.gov.uk");
a("london.gov.uk");
a("www.london.gov.uk");
a("maidstone.gov.uk");
a("www.maidstone.gov.uk");
a("merton.gov.uk");
a("www.merton.gov.uk");
a("midlothian.gov.uk");
a("www.midlothian.gov.uk");
a("miltonkeynes.gov.uk");
a("www.miltonkeynes.gov.uk");
a("newcastle.gov.uk");
a("www.newcastle.gov.uk");
a("n-kesteven.gov.uk");
a("www.n-kesteven.gov.uk");
a("northdown.gov.uk");
a("www.northdown.gov.uk");
a("north-herts.gov.uk");
a("www.north-herts.gov.uk");
a("northnorfolk.org");
a("www.northnorfolk.org");
a("nottinghamshire.gov.uk");
a("www.nottinghamshire.gov.uk");
a("n-somerset.gov.uk");
a("www.n-somerset.gov.uk");
a("pendle.gov.uk");
a("www.pendle.gov.uk");
a("peterborough.gov.uk");
a("www.peterborough.gov.uk");
a("reading.gov.uk");
a("www.reading.gov.uk");
a("redbridge.gov.uk");
a("www.redbridge.gov.uk");
a("ribblevalley.gov.uk");
a("www.ribblevalley.gov.uk");
a("richmondshire.gov.uk");
a("www.richmondshire.gov.uk");
a("rochford.gov.uk");
a("www.rochford.gov.uk");
a("rossendale.gov.uk");
a("www.rossendale.gov.uk");
a("rother.gov.uk");
a("www.rother.gov.uk");
a("rotherham.gov.uk");
a("www.rotherham.gov.uk");
a("rugby.gov.uk");
a("www.rugby.gov.uk");
a("ryedale.gov.uk");
a("www.ryedale.gov.uk");
a("scotborders.gov.uk");
a("www.scotborders.gov.uk");
a("sevenoaks.gov.uk");
a("www.sevenoaks.gov.uk");
a("sheffield.gov.uk");
a("www.sheffield.gov.uk");
a("slough.gov.uk");
a("www.slough.gov.uk");
a("solihull.gov.uk");
a("www.solihull.gov.uk");
a("somerset.gov.uk");
a("www.somerset.gov.uk");
a("southampton.gov.uk");
a("www.southampton.gov.uk");
a("southend.gov.uk");
a("www.southend.gov.uk");
a("southglos.gov.uk");
a("www.southglos.gov.uk");
a("southlanarkshire.gov.uk");
a("www.southlanarkshire.gov.uk");
a("southwark.gov.uk");
a("www.southwark.gov.uk");
a("staffordshire.gov.uk");
a("www.staffordshire.gov.uk");
a("staffsmoorlands.gov.uk");
a("www.staffsmoorlands.gov.uk");
a("stirling.gov.uk");
a("www.stirling.gov.uk");
a("tandridge.gov.uk");
a("www.tandridge.gov.uk");
a("tauntondeane.gov.uk");
a("www.tauntondeane.gov.uk");
a("threerivers.gov.uk");
a("www.threerivers.gov.uk");
a("tmbc.gov.uk");
a("www.tmbc.gov.uk");
a("torbay.gov.uk");
a("www.torbay.gov.uk");
a("uttlesford.gov.uk");
a("www.uttlesford.gov.uk");
a("valeofglamorgan.gov.uk");
a("www.valeofglamorgan.gov.uk");
a("walthamforest.gov.uk");
a("www.walthamforest.gov.uk");
a("warrington.gov.uk");
a("www.warrington.gov.uk");
a("wellingborough.gov.uk");
a("www.wellingborough.gov.uk");
a("westdevon.gov.uk");
a("www.westdevon.gov.uk");
a("west-lindsey.gov.uk");
a("www.west-lindsey.gov.uk");
a("westminster.gov.uk");
a("www.westminster.gov.uk");
a("westoxon.gov.uk");
a("www.westoxon.gov.uk");
a("westsussex.gov.uk");
a("www.westsussex.gov.uk");
a("wigan.gov.uk");
a("www.wigan.gov.uk");
a("wirral.gov.uk");
a("www.wirral.gov.uk");
a("wolverhampton.gov.uk");
a("www.wolverhampton.gov.uk");

R = new RuleSet("UN.org");
R.rules.push(new Rule("^http://un\\.org/", "https://un.org/"));
R.rules.push(new Rule("^http://www\\.un\\.org/", "https://www.un.org/"));
a("www.un.org");
a("un.org");

R = new RuleSet("UNFPA.org");
R.rules.push(new Rule("^http://www\\.unfpa\\.org/", "https://www.unfpa.org/"));
R.rules.push(new Rule("^http://unfpa\\.org/", "https://www.unfpa.org/"));
a("www.unfpa.org");
a("unfpa.org");

R = new RuleSet("UNIDO.org");
R.rules.push(new Rule("^http://www\\.unido\\.org/", "https://www.unido.org/"));
a("www.unido.org");

R = new RuleSet("UNM");
R.rules.push(new Rule("^http://(?:www\\.)?unm\\.edu/", "https://www.unm.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?ece\\.unm\\.edu/", "https://www.ece.unm.edu/"));
a("unm.edu");
a("www.unm.edu");
a("ece.unm.edu");
a("www.ece.unm.edu");

R = new RuleSet("UNODC.org");
R.rules.push(new Rule("^http://www\\.unodc\\.org/", "https://www.unodc.org/"));
R.rules.push(new Rule("^http://unodc\\.org/", "https://www.unodc.org/"));
a("www.unodc.org");
a("unodc.org");

R = new RuleSet("UNSW");
R.rules.push(new Rule("^http://(www\\.)?unsw\\.edu\\.au/", "https://www.unsw.edu.au/"));
a("*.unsw.edu.au");

R = new RuleSet("UOL (partial)");
R.rules.push(new Rule("^http://mtv\\.uol\\.com\\.br/", "https://mtv.uol.com.br/"));
a("mtv.uol.com.br");

R = new RuleSet("UOregon (Partial!)");
R.rules.push(new Rule("^http://(oregoncis|blackboard|distanceeducation|counseling|duckweb|hr2|ir|it|pcs|budgetmotel|brp|libweb|lcb|odt|scholarsbank|wiki|systems\\.cs|www2\\.lcb|www\\.(cs|law|lcb))\\.uoregon\\.edu/", "https://$1.uoregon.edu/"));
R.rules.push(new Rule("^http://(ba|safetyweb)\\.uoregon\\.edu/sites/", "https://$1.uoregon.edu/sites/"));
R.rules.push(new Rule("^http://parking\\.uoregon\\.edu/(sites|misc|_images)/", "https://parking.uoregon.edu/$1/"));
a("*.uoregon.edu");

R = new RuleSet("UPC");
R.rules.push(new Rule("^http://(?:www\\.)?upc\\.nl/", "https://www.upc.nl/"));
a("*.upc.nl");

R = new RuleSet("UPU.int");
R.rules.push(new Rule("^http://www\\.upu\\.int/", "https://www.upu.int/"));
R.rules.push(new Rule("^http://upu\\.int/", "https://www.upu.int/"));
a("www.upu.int");
a("upu.int");

R = new RuleSet("UQ WiMAX");
R.rules.push(new Rule("^http://(www\\.)?uqwimax\\.jp/", "https://www.uqwimax.jp/"));
a("uqwimax.jp");
a("www.uqwimax.jp");

R = new RuleSet("US Congressional Budget Office");
R.rules.push(new Rule("^http://(?:www\\.)?cbo\\.gov/", "https://www.cbo.gov/"));
a("cbo.gov");
a("www.cbo.gov");

R = new RuleSet("US Department of Veterans Affairs");
R.rules.push(new Rule("^https?://(www\\.)?va\\.gov/opa/fact/index\\.asp($|\\?)", "https://www.va.gov/opa/publications/factsheets.asp"));
R.rules.push(new Rule("^https?://(www\\.)?va\\.gov/(cbo|CBO)/rates\\.asp($|\\?)", "https://www.va.gov/CBO/apps/rates/index.asp"));
R.rules.push(new Rule("^http://www\\.(ebenefits|vendorportal\\.ecms|vis\\.fsc|1010ez\\.med|myhealth|pay|tms|valu|vba|visn23?)\\.va\\.gov/", "https://www.$1.va.gov/"));
R.rules.push(new Rule("^http://(iris|uploads|www4)\\.va\\.gov/", "https://$1.va.gov/"));
R.rules.push(new Rule("^http://www1\\.va\\.gov/", "https://www.va.gov/"));
R.rules.push(new Rule("^(http://(www\\.)?|https://)(fasttrack|gibill|move|vacanteen|vacareers|voa)\\.va\\.gov/", "https://www.$3.va.gov/"));
R.rules.push(new Rule("^(http://(www\\.)?|(https://www\\.))(insurance|((tas|vabenefits|vaonce|vip)\\.vba))\\.va\\.gov/", "https://$4.va.gov/"));
R.rules.push(new Rule("^(http://(www\\.)?|(https://www\\.))(((assessments|login|mst|my|users|vct)\\.)?vaforvets)\\.va\\.gov/", "https://$4.va.gov/"));
R.rules.push(new Rule("^https?://(www\\.)?va\\.gov/", "https://www.va.gov/"));
R.exclusions.push(new Exclusion("^http://www\\.va\\.gov/kids($|/)"));
a("www.ebenefits.va.gov");
a("www.vendorportal.ecms.va.gov");
a("www.vis.fsc.va.gov");
a("www.1010ez.med.va.gov");
a("www.myhealth.va.gov");
a("www.pay.va.gov");
a("www.tms.va.gov");
a("www.valu.va.gov");
a("www.visn2.va.gov");
a("www.visn23.va.gov");
a("iris.va.gov");
a("uploads.va.gov");
a("www1.va.gov");
a("www4.va.gov");
a("fasttrack.va.gov");
a("www.fasttrack.va.gov");
a("gibill.va.gov");
a("www.gibill.va.gov");
a("move.va.gov");
a("www.move.va.gov");
a("vacanteen.va.gov");
a("www.vacanteen.va.gov");
a("vacareers.va.gov");
a("www.vacareers.va.gov");
a("voa.va.gov");
a("www.voa.va.gov");
a("insurance.va.gov");
a("www.insurance.va.gov");
a("vaforvets.va.gov");
a("*.vaforvets.va.gov");
a("www.*.vaforvets.va.gov");
a("*.vba.va.gov");
a("www.*.vba.va.gov");
a("va.gov");
a("www.va.gov");

R = new RuleSet("US Selective Service System");
R.rules.push(new Rule("^https?://sss\\.gov/", "https://www.sss.gov/"));
R.rules.push(new Rule("^http://(training|www)\\.sss\\.gov/", "https://$1.sss.gov/"));
a("sss.gov");
a("training.sss.gov");
a("www.sss.gov");

R = new RuleSet("US Social Forum (partial)");
R.rules.push(new Rule("^http://community\\.ussf2010\\.org/", "https://community.ussf2010.org/"));
a("community.ussf2010.org");

R = new RuleSet("US government (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(census|fbo|genome|medicare)\\.gov/", "https://www.$1.gov/"));
R.rules.push(new Rule("^http://(?:www\\.)?cms(?:\\.hhs)?\\.gov/", "https://www.cms.gov/"));
R.rules.push(new Rule("^http://assets\\.cms\\.gov/", "https://assets.cms.gov/"));
R.rules.push(new Rule("^http://questions\\.(cms|medicare)\\.gov/", "https://questions.$1.gov/"));
R.rules.push(new Rule("^http://(safeharbor|www)\\.export\\.gov/", "https://$1.export.gov/"));
R.rules.push(new Rule("^http://(www\\.)?fnal\\.gov/", "https://$1fnal.fov/"));
R.rules.push(new Rule("^http://intelligence\\.house\\.gov/", "https://intelligence.house.gov/"));
R.rules.push(new Rule("^http://web\\.nvd\\.nist\\.gov/", "https://web.nvd.nist.gov/"));
R.rules.push(new Rule("^http://(busines|publication)s\\.usa\\.gov/", "https://$1s.usa.gov/"));
R.rules.push(new Rule("^http://([\\w\\-]+\\.)?usajobs\\.gov/", "https://$1usajobs.gov/"));
R.rules.push(new Rule("^http://(?:www\\.)?fsa\\.usda\\.gov/", "https://www.fsa.usda.gov/"));
R.rules.push(new Rule("^http://(my|oip|(oip|pws)\\.sc\\.egov)\\.usda\\.gov/", "https://$1.usda.gov/"));
R.rules.push(new Rule("^http://postalinspectors\\.uspis\\.gov/", "https://postalinspectors.uspis.gov/"));
R.rules.push(new Rule("^http://(www\\.)?uspsoig\\.gov/", "https://$1uspsoig.gov/"));
a("census.gov");
a("www.census.gov");
a("cms.gov");
a("*.cms.gov");
a("export.gov");
a("*.export.gov");
a("fbo.gov");
a("*.fbo.gov");
a("fnal.gov");
a("*.fnal.gov");
a("genome.gov");
a("www.genome.gov");
a("cms.hhs.gov");
a("www.cms.hhs.gov");
a("intelligence.house.gov");
a("medicare.gov");
a("*.medicare.gov");
a("web.nvd.nist.gov");
a("*.usa.gov");
a("oip.sc.egov.usda.gov");
a("pws.sc.egov.usda.gov");
a("my.usda.gov");
a("oip.usda.gov");
a("usajobs.gov");
a("*.usajobs.gov");
a("postalinspectors.uspis.gov");
a("uspsoig.gov");
a("www.uspsoig.gov");

R = new RuleSet("USA.gov (partial)");
R.rules.push(new Rule("^http://search\\.usa\\.gov/", "https://search.usa.gov/"));
a("usa.gov");
a("*.usa.gov");

R = new RuleSet("USBank");
R.rules.push(new Rule("^http://(?:www\\.)?usbank\\.com/", "https://www.usbank.com/"));
a("usbank.com");
a("www.usbank.com");

R = new RuleSet("USDA-ARS");
R.rules.push(new Rule("^http://(?:www\\.)?ars\\.usda\\.gov/", "https://www.ars.usda.gov/"));
a("ars.usda.gov");
a("www.ars.usda.gov");

R = new RuleSet("USENIX");
R.rules.push(new Rule("^https?://www\\.usenix\\.org/", "https://db.usenix.org/"));
R.rules.push(new Rule("^http://db\\.usenix\\.org/", "https://db.usenix.org/"));
R.rules.push(new Rule("^https?://usenix\\.org/", "https://db.usenix.org/"));
a("usenix.org");
a("db.usenix.org");
a("www.usenix.org");

R = new RuleSet("USPS");
R.rules.push(new Rule("^http://usps\\.com/", "https://www.usps.com/"));
R.rules.push(new Rule("^http://(about|fast|gateway-cat|moversguide|shop|tools|www)\\.usps\\.com/", "https://$1.usps.com/"));
a("usps.com");
a("*.usps.com");

R = new RuleSet("UU.se");
R.rules.push(new Rule("^http://uu\\.se/", "https://www.uu.se/"));
R.rules.push(new Rule("^http://www\\.uu\\.se/", "https://www.uu.se/"));
R.rules.push(new Rule("^http://www-hotel\\.uu\\.se/", "https://www-hotel.uu.se/"));
R.rules.push(new Rule("^http://webmail\\.uu\\.se/", "https://webmail.uu.se/"));
R.rules.push(new Rule("^http://helpdesk\\.uu\\.se/", "https://helpdesk.uu.se/"));
R.rules.push(new Rule("^http://dropbox\\.uu\\.se/", "https://dropbox.uu.se/"));
R.rules.push(new Rule("^http://boxer\\.bmc\\.uu\\.se/", "https://boxer.bmc.uu.se/"));
R.rules.push(new Rule("^http://it\\.bmc\\.uu\\.se/", "https://it.bmc.uu.se/"));
R.rules.push(new Rule("^http://filer\\.anst\\.uu\\.se/", "https://filer.anst.uu.se/"));
R.rules.push(new Rule("^http://www\\.anst\\.uu\\.se/", "https://www.anst.uu.se/"));
R.rules.push(new Rule("^http://www\\.it\\.uu\\.se/", "https://www.it.uu.se/"));
R.rules.push(new Rule("^http://www\\.listserv\\.uu\\.se/", "https://www.listserv.uu.se/"));
R.rules.push(new Rule("^http://www\\.uaf\\.uu\\.se/", "https://www.uaf.uu.se/"));
R.rules.push(new Rule("^http://www\\.uppmax\\.uu\\.se/", "https://www.uppmax.uu.se/"));
R.rules.push(new Rule("^http://www\\.uuinnovation\\.uu\\.se/", "https://www.uuinnovation.uu.se/"));
R.rules.push(new Rule("^http://filer\\.student\\.uu\\.se/", "https://filer.student.uu.se/"));
R.rules.push(new Rule("^http://home\\.student\\.uu\\.se/", "https://home.student.uu.se/"));
R.rules.push(new Rule("^http://mail\\.teknik\\.uu\\.se/", "https://mail.teknik.uu.se/"));
R.rules.push(new Rule("^http://tor\\.uadm\\.uu\\.se/", "https://tor.uadm.uu.se/"));
a("boxer.bmc.uu.se");
a("it.bmc.uu.se");
a("www.uu.se");
a("helpdesk.uu.se");
a("dropbox.uu.se");
a("filer.anst.uu.se");
a("www.anst.uu.se");
a("filer.student.uu.se");
a("home.student.uu.se");
a("mail.teknik.uu.se");
a("tor.uadm.uu.se");
a("uu.se");
a("webmail.uu.se");
a("www-hotel.uu.se");
a("www.it.uu.se");
a("www.listserv.uu.se");
a("www.uaf.uu.se");
a("www.uppmax.uu.se");
a("www.uuinnovation.uu.se");

R = new RuleSet("UberTags (partial)");
R.rules.push(new Rule("^http://(\\w+)\\.ubertags\\.com/", "https://$1.ubertags.com/"));
a("apps.ubertags.com");
a("console.ubertags.com");

R = new RuleSet("Ubertt.org");
R.rules.push(new Rule("^http://(www\\.)?ubertt\\.org/", "https://ubertt.org/"));
a("ubertt.org");
a("www.ubertt.org");

R = new RuleSet("Ubuntu (partial)");
R.rules.push(new Rule("^http://(cloud|help|uec-images|wiki)\\.ubuntu\\.com/", "https://$1.ubuntu.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?ubuntuone\\.com/", "https://ubuntuone.com/"));
a("*.ubuntu.com");
a("ubuntuone.com");
a("www.ubuntuone.com");

R = new RuleSet("Uhrzeit.org (partial)");
R.rules.push(new Rule("^http://(www\\.)?atomic-clock\\.org\\.uk/", "https://www.atomic-clock.org.uk/"));
R.rules.push(new Rule("^http://(www\\.)?la-hora\\.org/", "https://www.la-hora.org/"));
R.rules.push(new Rule("^http://(www\\.)?uhrzeit\\.org/(anmeldung|bilder|img|shop|sys)/", "https://www.uhrzeit.org/$2/"));
a("atomic-clock.org.uk");
a("*.atomic-clock.org.uk");
a("la-hora.org");
a("*.la-hora.org");
a("uhrzeit.org");
a("www.uhrzeit.org");

R = new RuleSet("UiO");
R.rules.push(new Rule("^http://uio\\.no/", "https://uio.no/"));
R.rules.push(new Rule("^http://www\\.uio\\.no/", "https://www.uio.no/"));
R.rules.push(new Rule("^http://studweb\\.uio\\.no/", "https://studweb.uio.no/"));
R.rules.push(new Rule("^http://apollon\\.uio\\.no/", "https://apollon.uio.no/"));
R.rules.push(new Rule("^http://www\\.apollon\\.uio\\.no/", "https://www.apollon.uio.no/"));
a("uio.no");
a("www.uio.no");
a("studweb.uio.no");
a("apollon.uio.no");
a("www.apollon.uio.no");

R = new RuleSet("Uma.es");
R.rules.push(new Rule("^http://(?:www\\.)?([^/:@\\.]*)\\.cv\\.uma\\.es/", "https://$1.cv.uma.es/"));
R.rules.push(new Rule("^http://www\\.sci\\.uma\\.es/", "https://www.sci.uma.es/"));
R.rules.push(new Rule("^http://web\\.satd\\.uma\\.es/", "https://web.satd.uma.es/"));
a("*.cv.uma.es");
a("www.sci.uma.es");
a("web.satd.uma.es");

R = new RuleSet("Unbit.it (partial)");
R.rules.push(new Rule("^http://(www\\.)?unbit\\.it/", "https://$1unbit.it/"));
R.rules.push(new Rule("^http://(?:www\\.)?(wiki|projects)\\.unbit\\.it/", "https://$1.unbit.it/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?packages\\."));
a("unbit.it");
a("*.unbit.it");
a("www.*.unbit.it");

R = new RuleSet("Underground Gamer");
R.rules.push(new Rule("^http://(www\\.)?underground-gamer\\.com/", "https://www.underground-gamer.com/"));
a("www.underground-gamer.com");
a("underground-gamer.com");

R = new RuleSet("Underskog");
R.rules.push(new Rule("^http://(?:www\\.)?underskog\\.no/", "https://underskog.no/"));
a("underskog.no");
a("www.underskog.no");

R = new RuleSet("Uni-kl.de");
R.rules.push(new Rule("^http://www\\.unix-ag\\.uni-kl\\.de/", "https://www.unix-ag.uni-kl.de/"));
R.rules.push(new Rule("^http://www\\.uni-kl\\.de/", "https://www.uni-kl.de/"));
a("www.uni-kl.de");
a("www.unix-ag.uni-kl.de");

R = new RuleSet("Uniblue");
R.rules.push(new Rule("^http://(?:www\\.)?uniblue\\.com/", "https://d2iq4cp2qrughe.cloudfront.net/"));
a("uniblue.com");
a("www.uniblue.com");

R = new RuleSet("Unica (partial)");
R.rules.push(new Rule("^http://unicaondemand\\.com/", "https://www.unicaondemand.com/"));
R.rules.push(new Rule("^http://(\\d+)\\.unicaondemand\\.com/", "https://$1.unicaondemand.com/"));
a("unicaondemand.com");
a("*.unicaondemand.com");

R = new RuleSet("Unicom (partial)");
R.rules.push(new Rule("^http://totalrecall\\.switchingon\\.com/", "https://totalrecall.switchingon.com/"));
a("totalrecall.switchingon.com");

R = new RuleSet("Unigine");
R.rules.push(new Rule("^http://(eu4\\.|www\\.)?unigine\\.com/", "https://$1unigine.com/"));
a("unigine.com");
a("*.unigine.com");

R = new RuleSet("United San Antonio Federal Credit Union");
R.rules.push(new Rule("^https?://unitedsafcu\\.org/", "https://www.unitedsafcu.org/"));
R.rules.push(new Rule("^http://(([a-zA-Z0-9\\-])+\\.)unitedsafcu\\.org/", "https://$1unitedsafcu.org/"));
a("unitedsafcu.org");
a("*.unitedsafcu.org");

R = new RuleSet("United Airlines");
R.rules.push(new Rule("^http://(?:www\\.)?united\\.com/", "https://www.united.com/"));
R.rules.push(new Rule("^http://travel\\.united\\.com/", "https://travel.united.com/"));
R.rules.push(new Rule("^http://pss\\.united\\.com/", "https://pss.united.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?ua2go\\.com/", "https://www.ua2go.com/"));
a("united.com");
a("www.united.com");
a("travel.united.com");
a("pss.united.com");
a("ua2go.com");
a("www.ua2go.com");

R = new RuleSet("United Domains");
R.rules.push(new Rule("^http://(?:www\\.)?uniteddomains\\.com/", "https://www.uniteddomains.com/"));
R.rules.push(new Rule("^http://www\\.united-domains\\.de/", "https://www.united-domains.de/"));
a("uniteddomains.com");
a("www.uniteddomains.com");
a("www.united-domains.de");

R = new RuleSet("Universal Subtitles");
R.rules.push(new Rule("^http://universalsubtitles\\.org/", "https://www.universalsubtitles.org/"));
R.rules.push(new Rule("^http://(blog|www)\\.universalsubtitles\\.org/", "https://$1.universalsubtitles.org/"));
R.rules.push(new Rule("^http://s3\\.www\\.universalsubtitles\\.org/", "https://s3.amazonaws.com/s3.www.universalsubtitles.org/"));
a("universalsubtitles.org");
a("*.universalsubtitles.org");
a("s3.www.universalsubtitles.org");

R = new RuleSet("University of Southern Indiana (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?usi\\.edu/", "https://www.usi.edu/"));
R.rules.push(new Rule("^https://usi\\.edu/", "https://www.usi.edu/"));
a("usi.edu");
a("www.usi.edu");

R = new RuleSet("University of Alaska Jobs (uakjobs.com)");
R.rules.push(new Rule("^http://(?:www\\.)?uakjobs\\.com/", "https://www.uakjobs.com/"));
a("uakjobs.com");
a("www.uakjobs.com");

R = new RuleSet("University of Alaska (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?alaska\\.edu/", "https://www.alaska.edu/"));
R.rules.push(new Rule("^http://(authserv|((www\\.)?avo)|cirt|edir|elmo|email|(biotech\\.inbre)|lists|service|((www\\.)?uaonline)|((swf|uaf)-1\\.vpn)|yukon)\\.alaska\\.edu/", "https://$1.alaska.edu/"));
a("alaska.edu");
a("authserv.alaska.edu");
a("avo.alaska.edu");
a("www.avo.alaska.edu");
a("cirt.alaska.edu");
a("edir.alaska.edu");
a("elmo.alaska.edu");
a("email.alaska.edu");
a("biotech.inbre.alaska.edu");
a("lists.alaska.edu");
a("service.alaska.edu");
a("uaonline.alaska.edu");
a("www.uaonline.alaska.edu");
a("swf-1.vpn.alaska.edu");
a("uaf-1.vpn.alaska.edu");
a("www.alaska.edu");
a("yukon.alaska.edu");

R = new RuleSet("University of California (partial)");
R.rules.push(new Rule("^http://(www\\.)?admissions\\.ucsb\\.edu/", "https://www.admissions.ucsb.edu/"));
R.rules.push(new Rule("^http://(www\\.cs|ftp)\\.ucsb\\.edu/", "https://$1.ucsb.edu/"));
R.rules.push(new Rule("^http://extension\\.ucsb\\.edu/(css|images|portal)/", "https://extension.ucsb.edu/$1s/"));
R.rules.push(new Rule("^http://login\\.proxy\\.library\\.ucsb\\.edu(:\\d+)?/", "https://login.proxy.library.ucsb.edu/"));
a("admissions.ucsb.edu");
a("www.admissions.ucsb.edu");
a("www.cs.ucsb.edu");
a("extension.ucsb.edu");
a("ftp.ucsb.edu");
a("login.proxy.library.ucsb.edu");

R = new RuleSet("University of Eastern Finland (partial)");
R.rules.push(new Rule("^http://cs\\.joensuu\\.fi/", "https://cs.joensuu.fi/"));
R.rules.push(new Rule("^http://(?:www\\.)?uef\\.fi/", "https://www.uef.fi/"));
a("cs.joensuu.fi");
a("uef.fi");
a("www.uef.fi");

R = new RuleSet("University of Groningen (partial)");
R.rules.push(new Rule("^http://(www\\.)?rug\\.nl/(_definition/|sterrenkunde/([!_]css|_shared/|onderwijs/index!login))", "https://$1rug.nl/$2"));
R.rules.push(new Rule("^http://(?:www\\.)?astro\\.rug\\.nl/", "https://www.astro.rug.nl/"));
a("rug.nl");
a("*.rug.nl");
a("www.astro.rug.nl");

R = new RuleSet("University of Michigan (partial)");
R.rules.push(new Rule("^http://(www\\.)?law\\.umich\\.edu/", "https://$1law.umich.edu/"));
a("law.umich.edu");
a("www.law.umich.edu");

R = new RuleSet("University of North Texas (partial)");
R.rules.push(new Rule("^(https://|(http://(www\\.)?))((ci|coe|hsc|library|psychology)\\.)?unt\\.edu/", "https://www.$4unt.edu/"));
R.rules.push(new Rule("^(https://www\\.|(http://(www\\.)?))((studyabroad\\.admin)|afrotc|ally|ams|announce|annualreport|anthropology|c3b|calendar|call|careercenter|chile|citc|clear|compliance|conduct|coop|copyright|courses|dcbest|deanofstudents|development|dining|discoverypark|dos|dplife|eagleconnect|ecampus|ecampussupport|edo|ee|efec|emds|emergency|endow|eng|engineering|essc|etec|facilities|factbook|financialaid|forms|gallery|gartner|greeklife|healthcenter|home|honors|hr|((cme|profile)\\.hsc)|iarta|ieli|imaging|info|inhouse|international|internships|inthenews|itunes|jaguarconnect|(faculty(jobs)?)|jazz|jobs|journalism|kddi|larc|learningcenter|((irservices|iii)\\.library)|(((classes|moodle)\\.)?lt)|messaging|moneymanagement|mtse|music|my|myfs|myls|northtexan|orgs|osprey|paccar|pacs|policy|pps|reac|records|recsports|research|reslife|rms|rtvf|security|smartenergy|spanishmedia|sportpsych|staffcouncil|src|studentactivities|studentaffairs|studentlegal|surfaces|sustainable|tams|tara|tcet|telecom|texasbest|thecblor|tours|transferinstitute|transfernow|transition|trio|tsgs|txcdk|union|untonthesquare|untpreview|untsystem|veteranscenter|virtualtour|volunteer|vpaa|vpsd|vtl|web2|web3|webadmin|wiki)\\.unt\\.edu/", "https://$4.unt.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?psyc\\.unt\\.edu/", "https://psychology.unt.edu/"));
R.rules.push(new Rule("^https?://(www\\.)?unt\\.edu/policy/UNT_Policy/volume[0-9]/([0-9]+)_([0-9]+)\\.html$", "https://policy.unt.edu/policy/$2-$3"));
R.rules.push(new Rule("^https?://(www\\.)?unt\\.edu/policy/UNT_Policy/volume[0-9]/([0-9]+)_([0-9]+)_([0-9]+)\\.html$", "https://policy.unt.edu/policy/$2-$3-$4"));
a("unt.edu");
a("*.unt.edu");
a("www.*.unt.edu");
a("*.hsc.unt.edu");
a("www.*.hsc.unt.edu");
a("*.library.unt.edu");
a("www.*.library.unt.edu");
a("*.lt.unt.edu");
a("www.*.lt.unt.edu");
a("studyabroad.admin.unt.edu");
a("www.studyabroad.admin.unt.edu");

R = new RuleSet("University of Oxford (partial)");
R.rules.push(new Rule("^http://www\\.admin\\.ox\\.ac\\.uk/", "https://www.admin.ox.ac.uk/"));
a("www.admin.ox.ac.uk");

R = new RuleSet("University of Pennsylvania (partial)");
R.rules.push(new Rule("^http://medley\\.isc-seo\\.upenn\\.edu/", "https://medley.isc-seo.upenn.edu/"));
a("medley.isc-seo.upenn.edu");

R = new RuleSet("University of Southampton (partial)");
R.rules.push(new Rule("^http://www\\.noc\\.ac\\.uk/", "https://noc.ac.uk/"));
R.rules.push(new Rule("^http://noc\\.ac\\.uk/(f|sites)/", "https://noc.ac.uk/$1/"));
R.rules.push(new Rule("^http://(?:www\\.)?soton\\.ac\\.uk/", "https://www.soton.ac.uk/"));
R.rules.push(new Rule("^http://(www\\.)?jobs\\.soton\\.ac\\.uk/", "https://$1jobs.soton.ac.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?noc\\.soton\\.ac\\.uk/", "https://www.noc.soton.ac.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?sussed\\.soton\\.ac\\.uk/", "https://sussed.soton.ac.uk/"));
a("noc.ac.uk");
a("*.noc.ac.uk");
a("www.jobs.soton.ac.uk");
a("www.noc.soton.ac.uk");
a("sussed.soton.ac.uk");
a("www.sussed.soton.ac.uk");

R = new RuleSet("University of Strathclyde (partial)");
R.rules.push(new Rule("^http://www\\.strath\\.ac\\.uk/", "https://www.strath.ac.uk/"));
a("www.strath.ac.uk");

R = new RuleSet("University of Texas at Austin (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?utexas\\.edu/", "https://www.utexas.edu/"));
R.rules.push(new Rule("^http://(ideas|registrar|((www|catalog|metalib|dev)\\.lib))\\.utexas\\.edu/", "https://$1.utexas.edu/"));
R.rules.push(new Rule("^https://utexas\\.edu/", "https://www.utexas.edu/"));
a("utexas.edu");
a("www.utexas.edu");
a("ideas.utexas.edu");
a("registrar.utexas.edu");
a("www.lib.utexas.edu");
a("catalog.lib.utexas.edu");
a("metalib.lib.utexas.edu");
a("dev.lib.utexas.edu");

R = new RuleSet("University of Texas at Dallas");
R.rules.push(new Rule("^http://(?:www\\.)?utdallas\\.edu/", "https://www.utdallas.edu/"));
a("utdallas.edu");
a("www.utdallas.edu");

R = new RuleSet("University of Utah (partial)");
R.rules.push(new Rule("^http://(www\\.)?dailyutahchronicle\\.com/", "https://$1dailyutahchronicle.com/"));
R.rules.push(new Rule("^http://(www\\.)?uofulaw\\.org/", "https://$1uofulaw.org/"));
R.rules.push(new Rule("^http://(fbs\\.admin|muss\\.alumni|(www\\.)?csbs|go|(www\\.)?gradschool|www\\.umail|unid)\\.utah\\.edu/", "https://$1.utah.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?(cs|alumni)\\.utah\\.edu/", "https://www.$1.utah.edu/"));
R.rules.push(new Rule("^http://(?:www\\.)?law\\.utah\\.edu/", "https://uofulaw.org/"));
a("dailyutahchronicle.com");
a("www.dailyutahchronicle.com");
a("uofulaw.org");
a("www.uofulaw.org");
a("fbs.admin.utah.edu");
a("alumni.utah.edu");
a("muss.alumni.utah.edu");
a("www.alumni.utah.edu");
a("cs.utah.edu");
a("www.cs.utah.edu");
a("csbs.utah.edu");
a("support.csbs.utah.edu");
a("www.csbs.utah.edu");
a("go.utah.edu");
a("gradschool.utah.edu");
a("www.gradschool.utah.edu");
a("law.utah.edu");
a("www.law.utah.edu");
a("www.umail.utah.edu");
a("unid.utah.edu");

R = new RuleSet("University of Waterloo (partial)");
R.rules.push(new Rule("^http://(csclub|(www\\.)?cs)\\.uwaterloo\\.ca/", "https://$1.uwaterloo.ca/"));
a("csclub.uwaterloo.ca");
a("cs.uwaterloo.ca");
a("www.cs.uwaterloo.ca");

R = new RuleSet("Upay");
R.rules.push(new Rule("^http://(?:www\\.)?upay\\.co\\.uk/", "https://www.upay.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?upaymobile\\.co\\.uk/", "https://www.upaymobile.co.uk/"));
a("upay.co.uk");
a("www.upay.co.uk");
a("upaymobile.co.uk");
a("www.upaymobile.co.uk");

R = new RuleSet("Upplandsvasby.se");
R.rules.push(new Rule("^http://www\\.upplandsvasby\\.se/", "https://www.upplandsvasby.se/"));
a("www.upplandsvasby.se");

R = new RuleSet("Uprotect.it");
R.rules.push(new Rule("^http://(www\\.)?uprotect\\.it/", "https://uprotect.it/"));
a("uprotect.it");
a("www.uprotect.it");

R = new RuleSet("UrbanTerror.info (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?urbanterror\\.info/((cache|css|files|forums|images|members/register)/|downloads/.+\\.zip\\?key=[0-9a-f]+)", "https://www.urbanterror.info/$1"));
a("urbanterror.info");
a("*.urbanterror.info");

R = new RuleSet("US-Cert.gov");
R.rules.push(new Rule("^http://www\\.us-cert\\.gov/", "https://www.us-cert.gov/"));
R.rules.push(new Rule("^http://us-cert\\.gov/", "https://us-cert.gov/"));
a("www.us-cert.gov");
a("us-cert.gov");

R = new RuleSet("UserEcho (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?userecho\\.com/", "https://userecho.com/"));
a("userecho.com");
a("*.userecho.com");

R = new RuleSet("UserScripts.org");
R.rules.push(new Rule("^https?://www\\.userscripts\\.org/", "https://userscripts.org/"));
R.rules.push(new Rule("^http://userscripts\\.org/", "https://userscripts.org/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?userscripts\\.org/scripts/source/"));
a("userscripts.org");
a("www.userscripts.org");

R = new RuleSet("Uservoice (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?uservoice\\.com/images/", "https://cdn.uservoice.com/images/"));
R.rules.push(new Rule("^http://([^w]\\w*|\\w*[^w]|\\w{1,2}|\\w{4,})\\.uservoice\\.com/", "https://$1.uservoice.com/"));
R.exclusions.push(new Exclusion("^http://blog\\."));
a("uservoice.com");
a("*.uservoice.com");

R = new RuleSet("UsrJoy");
R.rules.push(new Rule("^http://(?:www\\.)?usrjoy\\.com/", "https://www.usrjoy.com/"));
a("usrjoy.com");
a("www.usrjoy.com");

R = new RuleSet("Ustream (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?ustream\\.tv/(blog|embed|en_US)/", "https://www.ustream.tv/$1/"));
R.rules.push(new Rule("^http://community\\.ustream\\.tv/favicon\\.ico", "https://getsatisfaction.com/favicon.ico"));
R.rules.push(new Rule("^http://static\\.ustream\\.tv/", "https://static.ustream.tv/"));
R.rules.push(new Rule("^http://static-cdn([12])\\.ustream\\.tv/", "https://secure-static-cdn$1.ustream.tv/"));
a("ustream.tv");
a("*.ustream.tv");

R = new RuleSet("Utah Education Network (partial)");
R.rules.push(new Rule("^http://uen\\.org/", "https://www.eun.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?uen\\.org/(css|images)/", "https://www.uen.org/$2/"));
R.rules.push(new Rule("^http://online\\.uen\\.org/", "https://online.uen.org/"));
a("uen.org");
a("online.uen.org");
a("www.uen.org");

R = new RuleSet("Utica College");
R.rules.push(new Rule("^http://(www\\.)?utica\\.edu/", "https://utica.edu/"));
a("www.utica.edu");
a("utica.edu");

R = new RuleSet("Utopia-Web (partial)");
R.rules.push(new Rule("^http://secure\\.utopia-web\\.com/", "https://secure.utopia-web.com/"));
a("secure.utopia-web.com");

R = new RuleSet("VG.no");
R.rules.push(new Rule("^http://www\\.vg\\.no/", "https://www.vg.no/"));
R.rules.push(new Rule("^http://vg\\.no/", "https://vg.no/"));
R.rules.push(new Rule("^http://static\\.vg\\.no/", "https://static.vg.no/"));
R.rules.push(new Rule("^http://static01\\.vg\\.no/", "https://static01.vg.no/"));
R.rules.push(new Rule("^http://static02\\.vg\\.no/", "https://static02.vg.no/"));
R.rules.push(new Rule("^http://static03\\.vg\\.no/", "https://static03.vg.no/"));
R.rules.push(new Rule("^http://static04\\.vg\\.no/", "https://static04.vg.no/"));
a("vg.no");
a("www.vg.no");
a("static.vg.no");
a("static01.vg.no");
a("static02.vg.no");
a("static03.vg.no");
a("static04.vg.no");

R = new RuleSet("VPN4ALL");
R.rules.push(new Rule("^http://(?:www\\.)vpn4all\\.com/", "https://www.vpn4all.com/"));
a("vpn4all.com");
a("www.vpn4all.com");

R = new RuleSet("VPNReactor.com");
R.rules.push(new Rule("^http://(members\\.|www\\.)?vpnreactor\\.com/", "https://$1vpnreactor.com/"));
a("vpnreactor.com");
a("*.vpnreactor.com");

R = new RuleSet("VPS.net (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?vps\\.net/blog/wp-content/themes/vps/images/(bgshadow\\d|logo)\\.png$", "https://control.vps.net/images/dark_night/$1.png"));
R.rules.push(new Rule("^http://(?:www\\.)?vps\\.net/images/(bgcity\\d\\.(jpg|png)|logo\\.png)$", "https://control.vps.net/images/dark_night/$1"));
R.rules.push(new Rule("^http://(www\\.)?control\\.vps\\.net/", "https://$1control.vps.net/"));
a("vps.net");
a("*.vps.net");
a("www.control.vps.net");

R = new RuleSet("VR.se");
R.rules.push(new Rule("^http://www\\.vr\\.se/", "https://www.vr.se/"));
R.rules.push(new Rule("^http://vr\\.se/", "https://www.vr.se/"));
a("vr.se");
a("www.vr.se");

R = new RuleSet("VTunnel");
R.rules.push(new Rule("^http://(?:www\\.)?vtunnel\\.com/", "https://vtunnel.com/"));
a("vtunnel.com");
a("www.vtunnel.com");

R = new RuleSet("Value Applications");
R.rules.push(new Rule("^http://(www\\.)?valueapplications\\.com/", "https://www.valueapplications.com/"));
a("valueapplications.com");
a("www.valueapplications.com");

R = new RuleSet("ValueClick (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?awltovhc\\.com/", "https://www.awltovhc.com/"));
R.rules.push(new Rule("^http://(?:media|secure)\\.fastclick\\.com/", "https://secure.fastclick.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?lduhtrp\\.net/", "https://www.lduhtrp.net/"));
R.rules.push(new Rule("^http://(?:secure\\.)?img-cdn\\.mediaplex\\.com/", "https://secure.img-cdn.mediaplex.com/"));
R.rules.push(new Rule("^http://(adfarm|app|img|mojofarm)\\.mediaplex\\.com/", "https://$1.mediaplex.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?pricerunner\\.co(?:m|\\.uk)/favicon\\.ico", "https://secure.pricerunner.com/imgserver/images/v3/favicon.ico"));
R.rules.push(new Rule("^http://(partner|secure)\\.pricerunner\\.com/", "https://$1.pricerunner.com/"));
R.rules.push(new Rule("^http://cdn-origin\\.snv\\.vcmedia\\.com/", "https://cdn-origin.snv.vcmedia.com/"));
R.rules.push(new Rule("^http://admin\\.valueclickmedia\\.com/", "https://admin.valueclickmedia.com/"));
a("awltovhc.com");
a("www.awltovhc.com");
a("*.fastclick.com");
a("lduhtrp.net");
a("www.lduhtrp.net");
a("adfarm.mediaplex.com");
a("app.mediaplex.com");
a("img.mediaplex.com");
a("img-cdn.mediaplex.com");
a("mojofarm.mediaplex.com");
a("secure.img-cdn.mediaplex.com");
a("pricerunner.com");
a("*.pricerunner.com");
a("pricerunner.co.uk");
a("*.pricerunner.co.uk");
a("admin.valueclickmedia.com");
a("cdn-origin.snv.vcmedia.com");

R = new RuleSet("Valve (partial)");
R.rules.push(new Rule("^http://(?:cdn\\.|www\\.)?streamcommunity\\.com/", "https://steamcommunity.com/"));
R.rules.push(new Rule("^http://store\\.steampowered\\.com/(jo|log)in", "https://store.steampowered.com/$1in"));
R.rules.push(new Rule("^http://steampowered\\.com/([\\w\\W]+)", "https://www.steampowered.com/$1"));
R.rules.push(new Rule("^http://(cafe|support|www)\\.steampowered\\.com/", "https://$1.steampowered.com/"));
R.rules.push(new Rule("^http://store\\.steampowered\\.com/public/images/", "https://store.steampowered.com/public/images/"));
R.rules.push(new Rule("^http://cdn\\.store\\.steampowered\\.com/", "https://store.streampowered.com/"));
a("steamcommunity.com");
a("*.steamcommunity.com");
a("steampowered.com");
a("*.steampowered.com");
a("cdn.store.steampowered.com");

R = new RuleSet("VanillaMastercard");
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.vanillamastercard\\.com/", "https://$1.vanillamastercard.com/"));
a("vanillamastercard.com");
a("*.vanillamastercard.com");

R = new RuleSet("Vast (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(?:staticv\\.net|vast\\.com)/", "https://www.vast.com/"));
a("staticv.net");
a("www.staticv.net");
a("vast.com");
a("*.vast.com");

R = new RuleSet("Vector Media Group");
R.rules.push(new Rule("^http://(?:www\\.)?vectormediagroup\\.com/", "https://www.vectormediagroup.com/"));
a("vectormediagroup.com");
a("www.vectormediagroup.com");

R = new RuleSet("Velaro (partial)");
R.rules.push(new Rule("^http://(c|service|sp)\\.velaro\\.com/", "https://$1.velaro.com/"));
a("c.velaro.com");
a("service.velaro.com");
a("sp.velaro.com");

R = new RuleSet("Vendetta Online (partial)");
R.rules.push(new Rule("^http://(www\\.)?vendetta-online\\.com/", "https://$1vendetta-online.com/"));
R.rules.push(new Rule("^http://images\\.vendetta-online\\.com/", "https://vendetta-online.com/"));
a("vendetta-online.com");
a("*.vendetta-online.com");

R = new RuleSet("Vendo Services (partial)");
R.rules.push(new Rule("^http://cdn1\\.vendocdn\\.com/", "https://cdn1.vendocdn.com/"));
R.rules.push(new Rule("^http://secure3\\.vend-o\\.com/", "https://secure3.vend-o.com/"));
a("cdn1.vendocdn.com");

R = new RuleSet("veracode.com");
R.rules.push(new Rule("^http://www\\.veracode\\.com/", "https://www.veracode.com/"));
R.rules.push(new Rule("^http://veracode\\.com/", "https://www.veracode.com/"));
a("www.veracode.com");
a("veracode.com");

R = new RuleSet("Verbraucher-sicher-online.de");
R.rules.push(new Rule("^http://(?:www\\.)?verbraucher-sicher-online\\.de/", "https://www.verbraucher-sicher-online.de/"));
a("verbraucher-sicher-online.de");
a("www.verbraucher-sicher-online.de");

R = new RuleSet("Vereinigte IKK");
R.rules.push(new Rule("^http://(?:www\\.)?vereinigte-ikk\\.de/", "https://www.vereinigte-ikk.de/"));
a("www.vereinigte-ikk.de");
a("vereinigte-ikk.de");

R = new RuleSet("Verified Voting");
R.rules.push(new Rule("^http://(?:www\\.)?verifiedvoting\\.org/", "https://www.verifiedvoting.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?verifiedvotingfoundation\\.org/", "https://www.verifiedvotingfoundation.org/"));
a("verifiedvoting.org");
a("www.verifiedvoting.org");
a("verifiedvotingfoundation.org");
a("www.verifiedvotingfoundation.org");

R = new RuleSet("Verizon");
R.rules.push(new Rule("^http://(?:www\\.)?verizon\\.com/", "https://www22.verizon.com/"));
R.rules.push(new Rule("^http://www22\\.verizon\\.com/", "https://www22.verizon.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?verizonwireless\\.com/", "https://www.verizonwireless.com/"));
R.exclusions.push(new Exclusion("^http://www22\\.verizon\\.com/secure/pages/viewbill/"));
R.exclusions.push(new Exclusion("^http://www22\\.verizon\\.com/Foryourhome/MyAccount/Unprotected/"));
a("www.verizon.com");
a("www22.verizon.com");
a("verizon.com");
a("www.verizonwireless.com");
a("verizonwireless.com");

R = new RuleSet("Versus Technologies");
R.rules.push(new Rule("^http://(\\w+\\.)?vstech\\.net/", "https://$1vstech.net/"));
a("vstech.net");
a("*.vstech.net");

R = new RuleSet("Vertical Media (partial)");
R.rules.push(new Rule("^http://mail\\.verticalmedia\\.com/", "https://mail.verticalmedia.com/"));
a("mail.verticalmedia.com");

R = new RuleSet("Vertical Web Media");
R.rules.push(new Rule("^http://(?:www\\.)?internetretailer\\.com/", "https://www.internetretailer.com/"));
a("internetretailer.com");
a("*.internetretailer.com");

R = new RuleSet("VerticalResponse");
R.rules.push(new Rule("^http://cts\\.vresp\\.com/", "https://cts.vresp.com/"));
a("cts.vresp.com");

R = new RuleSet("Vesess (partial)");
R.rules.push(new Rule("^http://app\\.curdbee\\.com/", "https://app.curdbee.com/"));
a("app.curdbee.com");

R = new RuleSet("Viaverio.com");
R.rules.push(new Rule("^http://(?:www\\.)?viaverio\\.com/", "https://www.viaverio.com/"));
a("viaverio.com");
a("www.viaverio.com");

R = new RuleSet("Victor Chandler International");
R.rules.push(new Rule("^http://betvictor\\.com/", "https://www.betvictor.com/"));
R.rules.push(new Rule("^http://www\\.betvictor\\.com/(images/|[\\w/]+/account/new)", "https://www.betvictor.com/$1"));
R.rules.push(new Rule("^http://assets([123])\\.image-repository\\.com/", "https://assets$1.image-repository.com/"));
R.rules.push(new Rule("^http://vcint\\.com/", "https://vcint.com/"));
R.rules.push(new Rule("^http://(?:webmail|www)\\.vcint\\.com/", "https://webmail.vcint.com/"));
R.rules.push(new Rule("^http://banners\\.victor\\.com/", "https://banners.victor.com/"));
a("betvictor.com");
a("www.betvictor.com");
a("*.image-repository.com");
a("vcint.com");
a("*.vcint.com");
a("banners.victor.com");
a("*.banners.victor.com");

R = new RuleSet("Viddler.com (partial)");
R.rules.push(new Rule("^http://cdn-static(-[0-9][0-9])?\\.viddler\\.com/", "https://cdn.static.viddler.com/"));
R.rules.push(new Rule("^http://cdn-thumbs\\.viddler\\.com/", "https://cdn-thumbs.viddler.com/"));
R.rules.push(new Rule("^http://support\\.viddler\\.com/", "https://support.viddler.com/"));
R.rules.push(new Rule("^http://(www\\.)?viddler\\.com/(embed/|favicon\\.ico|mini/|plans)", "https://www.viddler.com/$2"));
a("viddler.com");
a("cdn-static.viddler.com");
a("cdn-thumbs.viddler.com");
a("cdn.static.viddler.com");
a("support.viddler.com");
a("www.viddler.com");

R = new RuleSet("Vimeo");
R.rules.push(new Rule("^http://player\\.vimeo\\.com/", "https://player.vimeo.com/"));
R.rules.push(new Rule("^http://(?:secure\\.|www\\.)?vimeo\\.com/log_in", "https://secure.vimeo.com/log_in"));
R.rules.push(new Rule("^http://(?:secure-)?([ab])\\.vimeocdn\\.com/", "https://secure-$1.vimeocdn.com/"));
a("vimeo.com");
a("*.vimeo.com");
a("*.vimeocdn.com");

R = new RuleSet("Vin DiCarlo (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(secure\\.)?3questionsgetthegirl\\.com/", "https://$13questionsgetthegirl.com/"));
a("3questionsgetthegirl.com");
a("*.3questionsgetthegirl.com");

R = new RuleSet("Virgin Australia");
R.rules.push(new Rule("^http://virginaustralia\\.com/", "https://www.virginaustralia.com/"));
R.rules.push(new Rule("^http://(insurance|www)\\.virginaustralia\\.com/", "https://$1.virginaustralia.com/"));
a("virginaustralia.com");
a("*.virginaustralia.com");

R = new RuleSet("Virgin Mobile AU");
R.rules.push(new Rule("^http://www\\.virginmobile\\.com\\.au/", "https://www.virginmobile.com.au/"));
a("www.virginmobile.com.au");

R = new RuleSet("Virginia Mason Hospital & Medical Center");
R.rules.push(new Rule("^(http://(www\\.)?|https://)virginiamason\\.org/", "https://www.virginiamason.org/"));
a("virginiamason.org");
a("www.virginiamason.org");

R = new RuleSet("Virtual Privacy Office");
R.rules.push(new Rule("^http://(?:www\\.)?datenschutz\\.de/", "https://www.datenschutz.de/"));
a("datenschutz.de");
a("www.datenschutz.de");

R = new RuleSet("VirusTotal");
R.rules.push(new Rule("^http://(?:www\\.)?virustotal\\.com/", "https://www.virustotal.com/"));
a("virustotal.com");
a("www.virustotal.com");

R = new RuleSet("Virusec.com");
R.rules.push(new Rule("^http://www\\.escan\\.com/", "https://www.virusec.com/"));
R.rules.push(new Rule("^http://escan\\.com/", "https://www.virusec.com/"));
R.rules.push(new Rule("^http://virusec\\.com/", "https://www.virusec.com/"));
R.rules.push(new Rule("^http://www\\.virusec\\.com/", "https://www.virusec.com/"));
a("www.escan.com");
a("escan.com");
a("www.virusec.com");
a("virusec.com");

R = new RuleSet("Vision Airlines");
R.rules.push(new Rule("^http://(?:www\\.)?visionairlines\\.com/", "https://www.visionairlines.com/"));
a("visionairlines.com");
a("www.visionairlines.com");

R = new RuleSet("Vispa (partial)");
R.rules.push(new Rule("^http://secure\\.vispa\\.net\\.uk/", "https://secure.vispa.net.uk/"));
R.rules.push(new Rule("^http://(www\\.)?vispa(host|shop)\\.com/", "https://vispashop.com/"));
a("secure.vispa.net.uk");
a("vispahost.com");
a("www.vispahost.com");
a("vispashop.com");
a("www.vispashop.com");
a("*.www.vispashop.com");

R = new RuleSet("Vista Forums");
R.rules.push(new Rule("^http://www\\.vistax64\\.com/", "https://www.vistax64.com/"));
a("www.vistax64.com");

R = new RuleSet("Vistech Communications");
R.rules.push(new Rule("^http://(?:bundy\\.|www\\.)?vistech\\.net/", "https://bundy.vistech.net/"));
a("vistech.net");
a("*.vistech.net");

R = new RuleSet("Visual Paradigm");
R.rules.push(new Rule("^http://s1\\.linkvp\\.com/", "https://www.visual-paradigm.com/simages/"));
R.rules.push(new Rule("^http://(?:www\\.)?visual-paradigm\\.com/", "https://www.visual-paradigm.com/"));
a("s1.linkvp.com");
a("visual-paradigm.com");
a("www.visual-paradigm.com");

R = new RuleSet("VisualWebsiteOptimizer");
R.rules.push(new Rule("^http://(?:www\\.)?visualwebsiteoptimizer\\.com/", "https://visualwebsiteoptimizer.com/"));
R.rules.push(new Rule("^http://(v2)\\.visualwebsiteoptimizer\\.com/", "https://$1.visualwebsiteoptimizer.com/"));
a("visualwebsiteoptimizer.com");
a("www.visualwebsiteoptimizer.com");
a("v2.visualwebsiteoptimizer.com");

R = new RuleSet("VitalAds (partial)");
R.rules.push(new Rule("^http://(www\\.)?vitalads\\.com/", "https://$1vitalads.com/"));
a("vitalads.com");
a("www.vitalads.com");

R = new RuleSet("Vitalwerks (partial)");
R.rules.push(new Rule("^http://cdn\\.no-ip\\.com/", "https://noipcdn.s3.amazonaws.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?no-ip\\.com/(client/|company/[^$]|favicon\\.ico|images/|login|(1click|newUser)\\.php)", "https://www.no-ip.com/$1"));
a("no-ip.com");
a("*.no-ip.com");

R = new RuleSet("Vitamin T");
R.rules.push(new Rule("^http://(?:www\\.)?vitamintalent\\.com/", "https://vitamintalent.com/"));
a("vitamintalent.com");
a("www.vitamintalent.com");

R = new RuleSet("Vitelity");
R.rules.push(new Rule("^http://portal\\.vitelity\\.net/", "https://portal.vitelity.net/"));
a("portal.vitelity.net");

R = new RuleSet("Vivaciti (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?vivaciti\\.net/", "https://vivaciti.net/"));
R.exclusions.push(new Exclusion("^http://www\\.vivaciti\\.net/forum/$"));
a("vivaciti.net");
a("www.vivaciti.net");

R = new RuleSet("Vizzit.se");
R.rules.push(new Rule("^http://www\\.vizzit\\.se/", "https://www.vizzit.se/"));
a("www.vizzit.se");

R = new RuleSet("Vodafone");
R.rules.push(new Rule("^http://(?:www\\.)?vodafone\\.(co\\.nz|co\\.uk|de|ie)/", "https://www.vodafone.$1/"));
R.rules.push(new Rule("^http://online\\.vodafone\\.co\\.uk/", "https://online.vodafone.co.uk/"));
R.rules.push(new Rule("^http://shop\\.vodafone\\.(co\\.uk|de)/", "https://shop.vodafone.$1/"));
a("vodafone.ie");
a("www.vodafone.ie");
a("vodafone.co.uk");
a("www.vodafone.co.uk");
a("online.vodafone.co.uk");
a("shop.vodafone.co.uk");
a("vodafone.de");
a("www.vodafone.de");
a("shop.vodafone.de");
a("vodafone.co.nz");
a("www.vodafone.co.nz");

R = new RuleSet("Volcano eCigs");
R.rules.push(new Rule("^http://(?:www\\.)?volcanoecigs\\.com/", "https://www.volcanoecigs.com/"));
a("volcanoecigs.com");
a("www.volcanoecigs.com");

R = new RuleSet("Volkswagen Bank");
R.rules.push(new Rule("^http://(?:www\\.)?volkswagenbank\\.de/", "https://www.volkswagenbank.de/"));
R.rules.push(new Rule("^http://online-banking\\.volkswagenbank\\.de/", "https://online-banking.volkswagenbank.de/"));
a("*.volkswagenbank.de");
a("volkswagenbank.de");

R = new RuleSet("Volunteer² (partial)");
R.rules.push(new Rule("^http://(?:app\\.volunteer2|(?:www\\.)?myvolunteerpage)\\.com/", "https://app.volunteer2.com/"));
a("app.volunteer2.com");
a("myvolunteerpage.com");
a("www.myvolunteerpage.com");

R = new RuleSet("Vonage");
R.rules.push(new Rule("^http://(?:www\\.)?vonage\\.com/", "https://www.vonage.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?vonage\\.co\\.uk/", "https://www.vonage.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?vonage\\.ca/", "https://www.vonage.ca/"));
a("vonage.com");
a("www.vonage.com");
a("vonage.co.uk");
a("www.vonage.co.uk");
a("vonage.ca");
a("www.vonage.ca");

R = new RuleSet("voterVOICE");
R.rules.push(new Rule("^http://(?:www\\.)?votervoice\\.net/", "https://www.votervoice.net/"));
a("votervoice.net");
a("www.votervoice.net");

R = new RuleSet("Vovici.com (partial)");
R.rules.push(new Rule("^http://(desktop\\.|system\\.)?(www\\.)?vovici\\.com/", "https://$1vovici.com/"));
a("vovici.com");
a("desktop.vovici.com");
a("system.vovici.com");
a("www.vovici.com");

R = new RuleSet("Voxel.net");
R.rules.push(new Rule("^http://(www\\.|portal\\.)?voxel\\.net/", "https://$1voxel.net/"));
R.rules.push(new Rule("^http://(\\d\\w*)\\.voxcdn\\.com/", "https://$1.voxcdn.com/"));
a("voxel.net");
a("*.voxel.net");
a("*.voxcdn.com");

R = new RuleSet("Vueling");
R.rules.push(new Rule("^http://vueling\\.com/", "https://vueling.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.vueling\\.com/", "https://$1.vueling.com/"));
a("vueling.com");
a("*.vueling.com");

R = new RuleSet("Vuze");
R.rules.push(new Rule("^http://(?:www\\.)?vuze\\.com/", "https://www.vuze.com/"));
a("vuze.com");
a("www.vuze.com");

R = new RuleSet("vzaar (partial)");
R.rules.push(new Rule("^http://(www\\.)?vzaar\\.com/(blog/|favicon\\.ico$|help/|images/|login$|stylesheets/)", "https://vzaar.com/$2"));
R.rules.push(new Rule("^http://(assets[12]|framegrabs|resources|view)\\.vzaar\\.com/", "https://$1.vzaar.com/"));
R.rules.push(new Rule("^http://static\\.vzaar\\.com/", "https://s3.amazonaws.com/static.vzaar.com/"));
a("vzaar.com");
a("*.vzaar.com");

R = new RuleSet("WHMCS (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?whmcs\\.com/", "https://$1whmcs.com/"));
R.exclusions.push(new Exclusion("^http://(blog|docs|forum)\\."));
a("whmcs.com");
a("*.whmcs.com");

R = new RuleSet("WIPmania");
R.rules.push(new Rule("^http://(?:www\\.)?wipmania\\.com/", "https://www.wipmania.com/"));
R.rules.push(new Rule("^http://wipmania\\.com/", "https://wipmania.com/"));
a("www.wipmania.com");
a("wipmania.com");

R = new RuleSet("WP Engine");
R.rules.push(new Rule("^http://(w+\\.)?wpengine\\.com/", "https://$1wpengine.com/"));
a("wpengine.com");
a("*.wpengine.com");

R = new RuleSet("World Socialist Web Site");
R.rules.push(new Rule("^http://(?:www\\.)?wsws\\.org/", "https://www.wsws.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.wsws\\.org/", "https://$1.wsws.org/"));
a("wsws.org");
a("*.wsws.org");

R = new RuleSet("WTFuzz.com");
R.rules.push(new Rule("^http://www\\.wtfuzz\\.com/", "https://www.wtfuzz.com/"));
R.rules.push(new Rule("^http://wtfuzz\\.com/", "https://www.wtfuzz.com/"));
a("wtfuzz.com");
a("www.wtfuzz.com");

R = new RuleSet("Wachovia");
R.rules.push(new Rule("^http://wachovia\\.com/", "https://wachovia.com/"));
R.rules.push(new Rule("^http://(myed|odpsla|onlineservices|www)\\.wachovia\\.com/", "https://$1.wachovia.com/"));
a("wachovia.com");
a("*.wachovia.com");

R = new RuleSet("Waffles.fm");
R.rules.push(new Rule("^http://www\\.waffles\\.fm/", "https://waffles.fm/"));
a("waffles.fm");
a("www.waffles.fm");

R = new RuleSet("Wagner College");
R.rules.push(new Rule("^http://(www\\.)?wagner\\.edu/", "https://wagner.edu/"));
a("www.wagner.edu");
a("wagner.edu");

R = new RuleSet("Washington Post Company (partial)");
R.rules.push(new Rule("^http://subscription\\.washingtonpost\\.com/", "https://subscription.washingtonpost.com/"));
a("subscription.washingtonpost.com");

R = new RuleSet("Weatherzone (partial)");
R.rules.push(new Rule("^https?://weatherzone\\.com\\.au/", "https://www.weatherzone.com.au/"));
R.rules.push(new Rule("^http://www\\.weatherzone\\.com\\.au/(customise\\.jsp|i(mag|nclud)es/|join/)", "https://www.weatherzone.com.au/$1"));
R.rules.push(new Rule("^https?://resources\\.weatherzone\\.com\\.au/(?:wz/)?i(mag|nclud)es/", "https://www.weatherzone.com.au/i$1es/"));
R.exclusions.push(new Exclusion("^http://resources\\.weatherzone\\.com\\.au/(images/widgets/graphics|wz/images/(ads|openx|widgets/graphics))/"));
a("weatherzone.com.au");
a("*.weatherzone.com.au");

R = new RuleSet("Web Power (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?webpower\\.nl/", "https://www.webpower.nl/"));
a("webpower.nl");
a("www.webpower.nl");

R = new RuleSet("web-registry.com");
R.rules.push(new Rule("^http://(www\\.)?web-registry\\.com/", "https://web-registry.com/"));
a("web-registry.com");
a("www.web-registry.com");

R = new RuleSet("web.de");
R.rules.push(new Rule("^http://(?:www\\.)?web\\.de/", "https://web.de/"));
R.rules.push(new Rule("^http://web\\.de/", "https://web.de/"));
R.rules.push(new Rule("^http://logout\\.webde\\.uimserv\\.net/", "https://logout.webde.uimserv.net/"));
a("web.de");
a("*.web.de");
a("www.web.de");
a("logout.webde.uimserv.net");

R = new RuleSet("Web4U");
R.rules.push(new Rule("^http://web4u\\.cz/", "https://www.web4u.cz/"));
R.rules.push(new Rule("^http://(\\w+)\\.web4u\\.cz/", "https://$1.web4u.cz/"));
a("web4u.cz");
a("*.web4u.cz");

R = new RuleSet("WebAssign");
R.rules.push(new Rule("^http://(www\\.)?webassign\\.net/", "https://webassign.net/"));
a("www.webassign.net");
a("webassign.net");

R = new RuleSet("Web Faction");
R.rules.push(new Rule("^http://((blog|docs|help|my|www)\\.)?webfaction\\.com/", "https://$1webfaction.com/"));
a("webfaction.com");
a("*.webfaction.com");

R = new RuleSet("WebSense");
R.rules.push(new Rule("^http://www\\.websense\\.com/", "https://www.websense.com/"));
a("www.websense.com");

R = new RuleSet("WebType (partial)");
R.rules.push(new Rule("^http://www\\.webtype\\.com/(global|local)/", "https://www.webtype.com/$1"));
R.rules.push(new Rule("^http://(cloud\\.|pls\\.)?webtype\\.com/", "https://$1webtype.com/"));
a("webtype.com");
a("*.webtype.com");

R = new RuleSet("Webby Awards (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?webbyawards\\.com/", "https://www.webbyawards.com/"));
a("webbyawards.com");
a("www.webbyawards.com");

R = new RuleSet("Webgility (partial)");
R.rules.push(new Rule("^http://(www\\.)?(portal\\.)?webgility\\.com/", "https://$2webgility.com/"));
a("webgility.com");
a("portal.webgility.com");
a("www.webgility.com");

R = new RuleSet("Weborama (partial)");
R.rules.push(new Rule("^http://(?:a|el)static\\.weborama\\.fr/", "https://gs1.wpc.edgecastcdn.net/001F34/"));
R.rules.push(new Rule("^http://cstatic\\.weborama\\.fr/", "https://cstatic.weborama.fr/"));
R.rules.push(new Rule("^http://perf\\.weborama\\.fr/", "https://webo.solution.weborama.fr/"));
R.rules.push(new Rule("^http://(\\w+)\\.solution\\.weborama\\.fr/", "https://$1.solution.weborama.fr/"));
R.rules.push(new Rule("^http://s(?:sl|tatic)\\.weborama\\.fr/", "https://ssl.weborama.fr/"));
a("*.weborama.fr");
a("*.solution.weborama.fr");
a("*.sfr.solution.weborama.fr");
a("*.webo.solution.weborama.fr");

R = new RuleSet("Webropolsurveys.com");
R.rules.push(new Rule("^http://(www\\.)?webropolsurveys\\.com/", "https://www.webropolsurveys.com/"));
a("webropolsurveys.com");
a("www.webropolsurveys.com");

R = new RuleSet("Webs (partial)");
R.rules.push(new Rule("^http://(es\\.)?premium\\.members\\.webs\\.com/", "https://$1premium.members.webs.com/"));
a("premium.members.webs.com");
a("es.premium.members.webs.com");

R = new RuleSet("Webtrekk.net");
R.rules.push(new Rule("^http://gigaset01\\.webtrekk\\.net/", "https://gigaset01.webtrekk.net/"));
a("gigaset01.webtrekk.net");

R = new RuleSet("webtrends.com");
R.rules.push(new Rule("^http://(m|developer|statse)\\.webtrends\\.com/", "https://$1.webtrends.com/"));
a("*.webtrendslive.com");

R = new RuleSet("Webtru.st Keyserver");
R.rules.push(new Rule("^http://(www\\.)?pgp\\.webtru\\.st/", "https://pgp.webtru.st/"));
a("pgp.webtru.st");
a("www.pgp.webtru.st");

R = new RuleSet("Wellcome Trust Sanger Institute (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?sanger\\.ac\\.uk/", "https://www.sanger.ac.uk/"));
a("sanger.ac.uk");
a("www.sanger.ac.uk");

R = new RuleSet("Wells Fargo");
R.rules.push(new Rule("^http://wellsfargo\\.com/", "https://www.wellsfargo.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.wellsfargo\\.com/", "https://$1.wellsfargo.com/"));
a("wellsfargo.com");
a("*.wellsfargo.com");

R = new RuleSet("Weltbild.ch");
R.rules.push(new Rule("^http://(?:www\\.)?weltbild\\.ch/", "https://www.weltbild.ch/"));
a("weltbild.ch");
a("www.weltbild.ch");

R = new RuleSet("weoInvoice");
R.rules.push(new Rule("^http://(www\\.)?weoinvoice\\.com/", "https://www.weoinvoice.com/"));
a("www.weoinvoice.com");
a("weoinvoice.com");

R = new RuleSet("West Jet");
R.rules.push(new Rule("^http://westjet\\.com/", "https://www.westjet.com/"));
R.rules.push(new Rule("^http://(hg|www)\\.westjet\\.com/", "https://$1.westjet.com/"));
a("westjet.com");
a("*.westjet.com");

R = new RuleSet("WestlandUtrecht Bank");
R.rules.push(new Rule("^http://(?:www\\.)?westlandutrecht(?:bank)?\\.nl/", "https://www.westlandutrechtbank.nl/"));
R.rules.push(new Rule("^http://(?:www\\.)?mijnwestlandutrecht\\.nl/", "https://mijnwestlandutrecht.nl/"));
a("www.westlandutrecht.nl");
a("westlandutrecht.nl");
a("www.westlandutrechtbank.nl");
a("westlandutrechtbank.nl");
a("www.mijnwestlandutrecht.nl");
a("mijnwestlandutrecht.nl");

R = new RuleSet("Westpac");
R.rules.push(new Rule("^http://westpac\\.com\\.au/", "https://www.westpac.com.au/"));
R.rules.push(new Rule("^http://(businessonline|info|introducers|m\\.onlineinvesting|onlineinvesting|services|www)\\.westpac\\.com\\.au/", "https://$1.westpac.com.au/"));
a("westpac.com.au");
a("*.westpac.com.au");

R = new RuleSet("WhatCD");
R.rules.push(new Rule("^http://(?:www\\.)?what\\.cd/$", "https://ssl.what.cd/"));
a("what.cd");
a("www.what.cd");

R = new RuleSet("WhatIsMyIP");
R.rules.push(new Rule("^http://(?:www\\.)?whatismyip\\.com/", "https://www.whatismyip.com/"));
a("whatismyip.com");
a("www.whatismyip.com");

R = new RuleSet("Whatimg.com");
R.rules.push(new Rule("^http://(www\\.)?whatimg\\.com/", "https://whatimg.com/"));
a("whatimg.com");
a("www.whatimg.com");

R = new RuleSet("WirtschaftsWoche");
R.rules.push(new Rule("^http://(?:www\\.)?wiwo\\.de/", "https://www.wiwo.de/"));
a("wiwo.de");
a("www.wiwo.de");

R = new RuleSet("Widgetbox.com");
R.rules.push(new Rule("^http://(www\\.)?widgetbox\\.com/", "https://widgetbox.com/"));
R.rules.push(new Rule("^http://(www\\.)?(p\\.)?widgetserver\\.com/", "https://$2widgetserver.com/"));
a("widgetbox.com");
a("www.widgetbox.com");
a("widgetserver.com");
a("p.widgetserver.com");
a("www.widgetserver.com");

R = new RuleSet("Wiggle");
R.rules.push(new Rule("^http://(?:www\\.)?wiggle\\.co\\.uk/", "https://www.wiggle.co.uk/"));
a("wiggle.co.uk");
a("*.wiggle.co.uk");

R = new RuleSet("Wigle");
R.rules.push(new Rule("^http://(www\\.)?wigle\\.net/", "https://wigle.net/"));
a("wigle.net");
a("www.wigle.net");

R = new RuleSet("Wikidot (partial)");
R.rules.push(new Rule("^http://([\\w\\-_]+\\.)?wdfiles\\.com/", "https://$1wdfiles.com/"));
R.rules.push(new Rule("^http://(?:\\d)\\.([\\w\\-_]+)\\.wdfiles\\.com/", "https://$1.wdfiles.com/"));
R.rules.push(new Rule("^http://wikidot\\.com/", "https://www.wikidot.com/"));
R.rules.push(new Rule("^http://([\\w\\-_]+)\\.wikidot\\.com/local-", "https://$1.wikidot.com/local-"));
R.rules.push(new Rule("^http://(blog|snippets|static(-\\d)?|www)\\.wikidot\\.com/", "https://$1.wikidot.com/"));
R.exclusions.push(new Exclusion("^http://blog\\.wikidot\\.com/($|blog:.+[^/].*)"));
R.exclusions.push(new Exclusion("^http://snippets\\.wikidot\\.com/($|.+[^:].*)"));
a("wdfiles.com");
a("*.wdfiles.com");
a("1.*.wdfiles.com");
a("2.*.wdfiles.com");
a("3.*.wdfiles.com");
a("4.*.wdfiles.com");
a("5.*.wdfiles.com");
a("6.*.wdfiles.com");
a("7.*.wdfiles.com");
a("8.*.wdfiles.com");
a("9.*.wdfiles.com");
a("wikidot.com");
a("*.wikidot.com");

R = new RuleSet("Wikipedia");
R.rules.push(new Rule("^http://([^@:/]+\\.)?wik(ipedia|inews|isource|ibooks|iquote|iversity|tionary|imedia)\\.org/", "https://$1wik$2.org/"));
R.rules.push(new Rule("^http://(www\\.)?mediawiki\\.org/", "https://$1mediawiki.org/"));
R.rules.push(new Rule("^http://(www\\.)?wikimediafoundation\\.org/", "https://$1wikimediafoundation.org/"));
R.rules.push(new Rule("^http://enwp\\.org/", "https://en.wikipedia.org/wiki/"));
R.rules.push(new Rule("^http://frwp\\.org/", "https://fr.wikipedia.org/wiki/"));
R.exclusions.push(new Exclusion("^http://(apt|bayes|bayle|brewster|bug-attachment|commonsprototype.tesla.usability|commons.prototype|cs|cz|dataset2|de.prototype|download|dumps|ekrem|emery|en.prototype|ersch|etherpad|fenari|flaggedrevssandbox|flgrevsandbox|gallium|ganglia|ganglia3|harmon|hume|ipv4.labs|ipv6and4.labs|jobs|mlqt.tesla.usability|mobile.tesla.usability|m|nagios|noc|observium|oldusability|project2|prototype|results.labs|search|shop|sitemap|snapshot3|stafford|stats|status|svn|test.prototype|torrus|ubuntu|wiki-mail|yongle|wikitech)\\.wikimedia\\.org"));
R.exclusions.push(new Exclusion("^http://(static|download|m)\\.wikipedia\\.org/"));
a("*.wikipedia.org");
a("*.wikinews.org");
a("*.wikisource.org");
a("*.wikibooks.org");
a("*.wikiquote.org");
a("*.wikiversity.org");
a("*.wiktionary.org");
a("*.wikimedia.org");
a("wikipedia.org");
a("wikinews.org");
a("wikisource.org");
a("wikibooks.org");
a("wikiquote.org");
a("wikiversity.org");
a("wiktionary.org");
a("wikimedia.org");
a("mediawiki.org");
a("www.mediawiki.org");
a("wikimediafoundation.org");
a("www.wikimediafoundation.org");
a("enwp.org");
a("frwp.org");

R = new RuleSet("Wiley (partial)");
R.rules.push(new Rule("^http://onlinelibrary\\.wiley\\.com/store/([\\d\\.]+)(/[^/]+)?/asset/", "https://onlinelibrarystatic.wiley.com/store/$1$2/asset/"));
R.rules.push(new Rule("^http://onlinelibrarystatic\\.wiley\\.com/", "https://onlinelibrarystatic.wiley.com/"));
a("onlinelibrary.wiley.com");
a("onlinelibrarystatic.wiley.com");

R = new RuleSet("WinPcap");
R.rules.push(new Rule("^http://winpcap\\.org/", "https://winpcap.org/"));
R.rules.push(new Rule("^http://www\\.winpcap\\.org/", "https://www.winpcap.org/"));
a("winpcap.org");
a("www.winpcap.org");

R = new RuleSet("Wippies Webmail");
R.rules.push(new Rule("^http://webmail\\.wippies\\.com/", "https://webmail.wippies.com/"));
a("webmail.wippies.com");

R = new RuleSet("Wired for Change");
R.rules.push(new Rule("^http://([a-zA-Z0-9\\-]+)\\.wiredforchange\\.com/", "https://$1.wiredforchange.com/"));
R.rules.push(new Rule("^http://wiredforchange\\.com/", "https://wiredforchange.com/"));
a("wiredforchange.com");
a("*.wiredforchange.com");

R = new RuleSet("Wireshark");
R.rules.push(new Rule("^http://wireshark\\.org/", "https://wireshark.org/"));
R.rules.push(new Rule("^http://(anonsvn|www)\\.wireshark\\.org/", "https://$1.wireshark.org/"));
a("wireshark.org");
a("anonsvn.wireshark.org");
a("www.wireshark.org");

R = new RuleSet("Wistia (partial)");
R.rules.push(new Rule("^http://(app|buy|fast|rs-static|secure)\\.wistia\\.com/", "https://$1.wistia.com/"));
R.rules.push(new Rule("^http://home\\.wistia\\.com/images/", "https://home.wistia.com/images/"));
a("*.wistia.com");

R = new RuleSet("Wizards of the Coast");
R.rules.push(new Rule("^http://(?:www\\.)?wizards\\.com/", "https://www.wizards.com/"));
a("www.wizards.com");
a("wizards.com");

R = new RuleSet("Wolfram.com");
R.rules.push(new Rule("^http://(?:www\\.)?wolfram\\.com/", "https://www.wolfram.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?wolframalpha\\.com/", "https://www.wolframalpha.com/"));
R.rules.push(new Rule("^http://www([0-9][a-z]?)\\.wolframalpha\\.com/", "https://www$1.wolframalpha.com/"));
R.rules.push(new Rule("^http://www\\.?wolframcdn\\.com/", "https://www.wolframcdn.com/"));
a("wolfram.com");
a("www.wolfram.com");
a("www.wolframcdn.com");
a("wolframalpha.com");
a("*.wolframalpha.com");

R = new RuleSet("WordPress");
R.rules.push(new Rule("^http://wordpress\\.(com|org)/", "https://wordpress.$1/"));
R.rules.push(new Rule("^http://s\\.wordpress\\.(com|org)/", "https://www.wordpress.$1/"));
R.rules.push(new Rule("^http://s[0-9]\\.wordpress\\.(com|org)/", "https://secure.wordpress.$1/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.wordpress\\.(com|org)/", "https://$1.wordpress.$2/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.(trac|svn)\\.wordpress\\.org/", "https://$1.$2.wordpress.org/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.files\\.wordpress\\.com/", "https://$1.files.wordpress.com/"));
R.rules.push(new Rule("^http://s\\d*\\.wp\\.com/(\\?custom-css|i/|wp-content/|wp-includes/)", "https://s-ssl.wordpress.com/$1"));
R.exclusions.push(new Exclusion("http://s0\\.wp\\.com/wp-content/themes/vip/cheezcommon2/(css/content-hole|style)\\.css"));
R.exclusions.push(new Exclusion("^http://(([^/:@\\.]+)\\.)?wordpress\\.com/latex\\.php(\\?.*)?$"));
R.exclusions.push(new Exclusion("^http://([^/:@\\.]+)\\.blog\\.wordpress\\.com/"));
R.exclusions.push(new Exclusion("^http://([^/:@\\.]+)\\.blog\\.files\\.wordpress\\.com/"));
R.exclusions.push(new Exclusion("^http://([^/:@\\.]+)\\.forums\\.wordpress\\.com/"));
R.exclusions.push(new Exclusion("^http://([^/:@\\.]+)\\.support\\.wordpress\\.com/"));
a("wordpress.com");
a("*.wordpress.com");
a("wordpress.org");
a("*.wordpress.org");
a("*.trac.wordpress.org");
a("*.svn.wordpress.org");
a("*.files.wordpress.com");
a("*.wp.com");

R = new RuleSet("World Community Grid");
R.rules.push(new Rule("^http://www\\.worldcommunitygrid\\.org/", "https://secure.worldcommunitygrid.org/"));
a("www.worldcommunitygrid.org");

R = new RuleSet("WorstPills.org");
R.rules.push(new Rule("^http://(?:www\\.)?worstpills\\.org/", "https://www.worstpills.org/"));
a("worstpills.org");
a("www.worstpills.org");

R = new RuleSet("wuala");
R.rules.push(new Rule("^http://wuala\\.com/", "https://wuala.com/"));
R.rules.push(new Rule("^http://(www|forum|stats|thumb\\d+)\\.wuala\\.com/", "https://$1.wuala.com/"));
a("wuala.com");
a("*.wuala.com");

R = new RuleSet("Wyndham (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(canvasholidays|cheznous|cottages(4you|direct|election)|(english|french|irish|italian|scottish|welsh)-country-cottages|(individual-|james)villas|villas4you)\\.co\\.uk/", "https://www.$1.co.uk/"));
R.rules.push(new Rule("^http://(www\\.)?competitionsbywyndham\\.com\\.au/", "https://$1competitionsbywyndham.com.au/"));
R.rules.push(new Rule("^http://blog\\.cottages4you\\.co\\.uk/", "https://blog.cottages4you.co.uk/"));
R.rules.push(new Rule("^http://(?:www\\.)?((easy|welcome)cottages|resortquestsecure|secureholidays|worldmarkbywyndham|wyndhamrentals)\\.com/", "https://www.$1.com/"));
R.rules.push(new Rule("^http://(images\\.|www\\.)?hoseasons\\.co\\.uk/", "https://$1hoseasons.co.uk/"));
R.rules.push(new Rule("^http://landal(skilife)?\\.(\\w[\\w^z]\\w?)/", "https://www.landal$1.$2/"));
R.rules.push(new Rule("^http://www\\.landal(skilife)?\\.(\\w[\\w^z]\\w?)/(bp|db|favicons|img)/", "https://www.landal$1.$2/$3/"));
R.rules.push(new Rule("^http://(?:www\\.)?landal(?:skilife)?\\.cz/", "https://www.landal.cz/"));
R.rules.push(new Rule("^http://landal(campings|parkshop)\\.([bd]e|nl)/", "https://www.landal$1.$2/"));
R.rules.push(new Rule("^http://www\\.landacampings\\.([bd]e|nl)/(css|favicons|img)/", "https://www.landalcampings.$1/$2/"));
R.rules.push(new Rule("^http://(?:www\\.)?landalparkshop\\.de/", "https://www.landal.de/"));
R.rules.push(new Rule("^http://secure\\.landal\\.com/", "https://secure.landal.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?landalgreenparks\\.com/", "https://www.landal.com/"));
R.rules.push(new Rule("^http://(www\\.)?mijnlandal\\.nl/", "https://$1mijnlandal.nl/"));
R.rules.push(new Rule("^http://(www\\.)?ovscruise\\.com/", "https://$1ovscruise.com/"));
R.rules.push(new Rule("^http://prep\\.rci\\.com/", "https://prep.rci.com/"));
R.rules.push(new Rule("^http://(www\\.)?rcitravelstore\\.co\\.uk/(images/|includes/|managebooking/login\\.asp|shortlist/)", "https://$1rcitravelstore.co.uk/$2"));
R.rules.push(new Rule("^http://wyndham\\.com/", "https://www.wyndham.com/"));
R.rules.push(new Rule("^http://www\\.wyndham\\.com/(cms_content|hotels/images|resources)", "https://www.wyndham.com/$1/"));
R.rules.push(new Rule("^http://wynres\\.wyndham\\.com/", "https://wynres.wyndham.com/"));
R.rules.push(new Rule("^http://(hotels|new)\\.wyndhamvrap\\.com/", "https://$1.wyndhamvrap.com/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?landalskilife\\.(com|fr)/"));
R.exclusions.push(new Exclusion("^http://www\\.wyndhamvrap\\."));
a("canvasholidays.co.uk");
a("www.canvasholidays.co.uk");
a("cheznous.com");
a("www.cheznous.com");
a("competitionsbywyndham.com.au");
a("www.competitionsbywyndham.com.au");
a("cottages4you.co.uk");
a("*.cottages4you.co.uk");
a("cottagesdirect.co.uk");
a("www.cottagesdirect.co.uk");
a("cottageselection.co.uk");
a("www.cottageselection.co.uk");
a("easycottages.com");
a("www.easycottages.com");
a("english-country-cottages.co.uk");
a("*.english-country-cottages.co.uk");
a("french-country-cottages.co.uk");
a("*.french-country-cottages.co.uk");
a("hoseasons.co.uk");
a("*.hoseasons.co.uk");
a("individual-villas.co.uk");
a("www.individual-villas.co.uk");
a("irish-country-cottages.co.uk");
a("*.irish-country-cottages.co.uk");
a("italian-country-cottages.co.uk");
a("*.italian-country-cottages.co.uk");
a("jamesvillas.co.uk");
a("www.jamesvillas.co.uk");
a("landal.*");
a("secure.landal.com");
a("www.landal.*");
a("landalgreenparks.com");
a("www.landalgreenparks.com");
a("landalcampings.be");
a("www.landalcampings.be");
a("landalcampings.de");
a("www.landalcampings.de");
a("landalcampings.nl");
a("www.landalcampings.nl");
a("landalparkshop.*");
a("www.landalparkshop.*");
a("landalskilife.*");
a("www.landalskilife.*");
a("mijnlandal.nl");
a("www.mijnlandal.nl");
a("ovscruise.com");
a("www.ovscruise.com");
a("prep.rci.com");
a("rcitravelstore.co.uk");
a("www.rcitravelstore.co.uk");
a("resortquestsecure.com");
a("www.resortquestsecure.com");
a("secureholidays.com");
a("www.secureholidays.com");
a("scottish-country-cottages.co.uk");
a("www.scottish-country-cottages.co.uk");
a("villas4you.co.uk");
a("www.villas4you.co.uk");
a("welcomecottages.com");
a("www.welcomecottages.com");
a("welsh-country-cottages.co.uk");
a("www.welsh-country-cottages.co.uk");
a("worldmarkbywyndham.com");
a("www.worldmarkbywyndham.com");
a("wyndham.com");
a("*.wyndham.com");
a("wyndhamrentals.com");
a("www.wyndhamrentals.com");
a("*.wyndhamvrap.com");

R = new RuleSet("WyzAnt (partial)");
R.rules.push(new Rule("^http://wyzant\\.com/", "https://www.wyzant.com/"));
R.rules.push(new Rule("^http://www\\.wyzant\\.com/(DES/|(image|[gG]raphic|Les)s/|combiner\\.ashx|EmailTutor\\.aspx|(Script|Web)Resource\\.axd)", "https://www.wyzant.com/$1"));
a("wyzant.com");
a("www.wyzant.com");

R = new RuleSet("XDA Developers (partial)");
R.rules.push(new Rule("^http://(www\\.)?xda-developers\\.com/", "https://$1xda-developers.com/"));
R.rules.push(new Rule("^http://forum\\.xda-developers\\.com/favicon\\.ico", "https://xda-developers.com/favicon.ico"));
a("xda-developers.com");
a("www.xda-developers.com");

R = new RuleSet("XFCE (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(bugzilla|forum|translations|wiki)\\.xfce\\.org/", "https://$1.xfce.org/"));
a("bugzilla.xfce.org");
a("forum.xfce.org");
a("translations.xfce.org");
a("wiki.xfce.org");

R = new RuleSet("XMOS (partial)");
R.rules.push(new Rule("^http://(www\\.)?xmos\\.com/(download/|favicon\\.ico|files/|misc/|register|sites/|system/|/user/)", "https://$1xmos.com/$2/"));
a("xmos.com");
a("www.xmos.com");

R = new RuleSet("XO Communications (partial)");
R.rules.push(new Rule("^http://(register|secure)\\.cnchost\\.com/", "https://$1.cnchost.com/"));
R.rules.push(new Rule("^http://(apps|channelink)\\.xo\\.com/", "https://$1.xo.com/"));
a("*.cnchost.com");
a("*.xo.com");

R = new RuleSet("XO Skins");
R.rules.push(new Rule("^http://(?:www\\.)?xoskins\\.com/", "https://xoskins.com/"));
a("xoskins.com");
a("www.xoskins.com");

R = new RuleSet("XPD.se");
R.rules.push(new Rule("^http://www\\.xpd\\.se/", "https://www.xpd.se/"));
R.rules.push(new Rule("^http://xpd\\.se/", "https://xpd.se/"));
a("xpd.se");
a("www.xpd.se");

R = new RuleSet("XS4ALL (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?xs4all\\.nl/", "https://www.xs4all.nl/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?xs4all.nl/((%7E)|~)+"));
a("xs4all.nl");
a("www.xs4all.nl");

R = new RuleSet("Xfire (partial)");
R.rules.push(new Rule("^http://(www\\.)?xfire\\.com/lo(gin|st_password)", "https://$1xfire.com/lo$2"));
R.rules.push(new Rule("^http://(?:secure-)?media\\.xfire\\.com/", "https://secure-media.xfire.com/"));
R.rules.push(new Rule("^http://secure\\.xfire\\.com/", "https://secure.xfire.com/"));
a("*.xfire.com");

R = new RuleSet("Xing");
R.rules.push(new Rule("^http://(?:www\\.)?xing\\.com/", "https://www.xing.com/"));
R.rules.push(new Rule("^http://corporate\\.xing\\.com/", "https://corporate.xing.com/"));
a("xing.com");
a("*.xing.com");

R = new RuleSet("Xiph.org");
R.rules.push(new Rule("^http://(?:www\\.)?xiph\\.org/", "https://www.xiph.org/"));
R.rules.push(new Rule("^http://(svn|wiki|trac)\\.xiph\\.org/", "https://$1.xiph.org/"));
a("xiph.org");
a("www.xiph.org");
a("svn.xiph.org");
a("wiki.xiph.org");
a("trac.xiph.org");

R = new RuleSet("Xmarks");
R.rules.push(new Rule("^http://(?:www\\.)?xmarks\\.com/", "https://www.xmarks.com/"));
R.rules.push(new Rule("^http://(buy|download|login|my|static|thumbs)\\.xmarks\\.com/", "https://$1.xmarks.com/"));
a("xmarks.com");
a("*.xmarks.com");

R = new RuleSet("Yaha");
R.rules.push(new Rule("^http://yaha\\.no/", "https://yaha.no/"));
R.rules.push(new Rule("^http://www\\.yaha\\.no/", "https://www.yaha.no/"));
a("yaha.no");
a("www.yaha.no");

R = new RuleSet("Yakala.co");
R.rules.push(new Rule("^http://(www\\.)?yakala\\.co/", "https://www.yakala.co/"));
a("www.yakala.co");
a("yakala.co");

R = new RuleSet("Yamli API");
R.rules.push(new Rule("^http://api\\.yamli\\.com/", "https://api.yamli.com/"));
a("api.yamli.com");

R = new RuleSet("Yandex");
R.rules.push(new Rule("^http://(?:www\\.)?([^.]+)\\.yandex\\.(ru|net|st)/", "https://$1.yandex.$2/"));
R.rules.push(new Rule("^http://(?:www\\.)?yandex\\.(net|st)/", "https://yandex.$1/"));
R.rules.push(new Rule("^http://([^.]+)\\.([^.]+)\\.yandex\\.(ru|net)/", "https://$1.$2.yandex.$3/"));
R.rules.push(new Rule("^http://(?:www\\.)?([^.]+)\\.ya\\.ru/", "https://$1.ya.ru/"));
R.rules.push(new Rule("^http://(?:www\\.)?moikrug\\.ru/", "https://moikrug.ru/"));
R.rules.push(new Rule("^https://static-maps\\.yandex\\.ru/", "http://static-maps.yandex.ru/"));
R.rules.push(new Rule("^https://(cs-ellpic|mdata)\\.yandex\\.net/", "http://$1.yandex.net/"));
R.exclusions.push(new Exclusion("^http://api-maps\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://bar-widgets\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://blogs\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://cs-ellpic\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://cs-thumb\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://dict\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://cards\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://dzen\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://encyclopedia\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://feedback\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://fotki\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://images\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://lingvo\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://maps\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://static-maps\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://metro\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://music\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://news\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://pogoda\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://presocial\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://rasp\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://sprav\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://slovari\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://tv\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://wdgt\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://weather\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://wordstat\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://www\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://(www\\.)?[^.]+\\.ya\\.ru/"));
R.exclusions.push(new Exclusion("^http://mirror.yandex.ru/"));
R.exclusions.push(new Exclusion("^http://probki\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://blogs\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://fotki\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://images\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://music\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://probki\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://video\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://wdgt\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://www\\.ya\\.ru"));
R.exclusions.push(new Exclusion("^http://narod[0-9]*\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://suggest\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://suggest-[a-z]+\\.yandex\\.(ru|net)/"));
R.exclusions.push(new Exclusion("^http://content\\.webmaster\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://m\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://internet.yandex.ru/"));
R.exclusions.push(new Exclusion("^http://awaps\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://clck\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://copy\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://hghltd\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://kiks\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://print\\.maps\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://market-click[0-9]+\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://mc\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://mdata\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://wrz\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://vec[0-9]+\\.maps\\.yandex\\.(ru|net)/"));
R.exclusions.push(new Exclusion("^http://jgo\\.maps\\.yandex\\.(ru|net)/"));
R.exclusions.push(new Exclusion("^http://[^.]+-tub\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://[^.]+-tub\\.yandex\\.ru/"));
R.exclusions.push(new Exclusion("^http://[^.]+-tub-[^.]+\\.yandex\\.net/"));
R.exclusions.push(new Exclusion("^http://[^.]+-tub-[^.]+\\.yandex\\.ru/"));
a("yandex.ru");
a("yandex.net");
a("yandex.st");
a("ya.ru");
a("*.yandex.ru");
a("*.yandex.net");
a("*.yandex.st");
a("*.ya.ru");
a("*.friends.yandex.net");
a("*.maps.yandex.ru");
a("*.video.yandex.ru");
a("moikrug.ru");
a("*.moikrug.ru");

R = new RuleSet("Yawoot (partial)");
R.rules.push(new Rule("^http://(img|t)\\.yawoot\\.com/", "https://$1.yawoot.com/"));
a("img.yawoot.com");
a("t.yawoot.com");

R = new RuleSet("Yellow Pages IMA (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?(?:localsearch|yp)association\\.org/", "https://localsearchassociation.org/"));
R.rules.push(new Rule("^http://(?:www\\.)?yellowpagesoptout\\.com/", "https://www.yellowpagesoptout.com/"));
a("localsearchassociation.org");
a("*.localsearchassociation.org");
a("yellowpagesoptout.com");
a("*.yellowpagesoptout.com");
a("ypassociation.org");
a("www.ypassociation.org");

R = new RuleSet("Yemeksepeti");
R.rules.push(new Rule("^http://images\\.yemeksepetim\\.com/", "https://images.yemeksepeti.com/"));
R.rules.push(new Rule("^http://yemeksepeti\\.com/", "https://www.yemeksepeti.com/"));
R.rules.push(new Rule("^http://([^/:@]*)\\.yemeksepeti\\.com/", "https://$1.yemeksepeti.com/"));
a("yemeksepeti.com");
a("images.yemeksepetim.com");
a("*.yemeksepeti.com");

R = new RuleSet("Yeshiva University");
R.rules.push(new Rule("^http://(?:www\\.)?yu\\.edu/", "https://yu.edu/"));
a("www.yu.edu");
a("yu.edu");

R = new RuleSet("Yieldmanager.com");
R.rules.push(new Rule("^http://(ad|content-ssl)\\.yieldmanager\\.com/", "https://$1.yieldmanager.com/"));
R.rules.push(new Rule("^http://(\\w+(?:\\.\\w+)?)\\.dp\\.yieldmanager\\.net/", "https://$1.dp.yieldmanager.net/"));
a("ad.yieldmanager.com");
a("*.yieldmanager.net");
a("*.dp.yieldmanager.net");
a("*.eu.dp.yieldmanager.net");
a("tm.*.dp.yieldmanager.net");

R = new RuleSet("York College of Nebraska");
R.rules.push(new Rule("^http://(?:www\\.)?york\\.edu/", "https://york.edu/"));
a("www.york.edu");
a("york.edu");

R = new RuleSet("York College of New York");
R.rules.push(new Rule("^http://(?:www\\.)?york\\.cuny\\.edu/", "https://york.cuny.edu/"));
a("www.york.cuny.edu");
a("york.cuny.edu");

R = new RuleSet("YouTube (partial)");
R.rules.push(new Rule("^http://(www\\.)?youtube\\.com/", "https://$1youtube.com/"));
R.rules.push(new Rule("^http://(br|de|es|fr|il|img|insight|jp|m|nl|uk)\\.youtube\\.com/", "https://$1.youtube.com/"));
R.rules.push(new Rule("^http://([^/@:\\.]+)\\.ytimg\\.com/", "https://$1.ytimg.com/"));
R.rules.push(new Rule("^http://youtu\\.be/", "https://youtu.be/"));
R.rules.push(new Rule("^http://(?:www\\.)?youtube-nocookie\\.com/", "https://www.youtube-nocookie.com/"));
R.exclusions.push(new Exclusion("^http://(?:www\\.)?youtube\\.com/crossdomain\\.xml"));
a("youtube.com");
a("*.youtube.com");
a("*.ytimg.com");
a("youtu.be");
a("youtube-nocookie.com");
a("www.youtube-nocookie.com");

R = new RuleSet("Youmix (partial)");
R.rules.push(new Rule("^http://(t\\.(album|track)|static)\\.youmix\\.co\\.uk/", "https://s3.amazonaws.com/$1.youmix.co.uk/"));
a("t.album.youmix.co.uk");
a("static.youmix.co.uk");
a("t.track.youmix.co.uk");

R = new RuleSet("Your Freedom");
R.rules.push(new Rule("^http://(?:www\\.)?your-freedom\\.net/", "https://www.your-freedom.net/"));
a("your-freedom.net");
a("www.your-freedom.net");

R = new RuleSet("Yubico");
R.rules.push(new Rule("^http://yubico\\.com/", "https://yubico.com/"));
R.rules.push(new Rule("^http://(www|store|openid|api|upload)\\.yubico\\.com/", "https://$1.yubico.com/"));
a("yubico.com");
a("www.yubico.com");
a("store.yubico.com");
a("openid.yubico.com");
a("api.yubico.com");
a("upload.yubico.com");

R = new RuleSet("ZDNet");
R.rules.push(new Rule("^http://(?:origin\\.|www\\.)?zdnet\\.com/", "https://www.zdnet.com/"));
a("zdnet.com");
a("*.zdnet.com");

R = new RuleSet("ZTunnel");
R.rules.push(new Rule("^http://(?:www\\.)?ztunnel\\.com/", "https://ztunnel.com/"));
a("ztunnel.com");
a("www.ztunnel.com");

R = new RuleSet("Zabbix (partial)");
R.rules.push(new Rule("^http://support\\.zabbix\\.com/", "https://support.zabbix.com/"));
a("support.zabbix.com");

R = new RuleSet("Zareason.com");
R.rules.push(new Rule("^http://www\\.zareason\\.com/", "https://www.zareason.com/"));
R.rules.push(new Rule("^http://zareason\\.com/", "https://zareason.com/"));
a("www.zareason.com");
a("zareason.com");

R = new RuleSet("Zazzle (partial)");
R.rules.push(new Rule("^http://zazzle\\.com/", "https://www.zazzle.com/"));
R.rules.push(new Rule("^http://www\\.zazzle\\.com/(assets/|(\\w+\\+)?cases|c[ro]/|create|custom/|keychains|(kitchen|\\w+\\+holiday)\\+gifts|lgn/|macbook\\+sleeves|m[ky]/|newcustomgifts|pd/|pillows|rlv/|zazzleblack|\\w+\\d{10,20})", "https://www.zazzle.com/$1"));
R.rules.push(new Rule("^http://asset\\.zcache\\.com/", "https://www.zazzle.com/"));
R.rules.push(new Rule("^http://rlv\\.zcache\\.com/", "https://www.zazzle.com/rlv/"));
R.rules.push(new Rule("^http://tracks\\.www\\.zazzle\\.com/", "https://tracks.www.zazzle.com/"));
R.exclusions.push(new Exclusion("^http://www\\.zazzle\\.com/($|[\\w\\+]+pillows|gift|[\\w\\+]+macbook\\+sleeves|printed\\+envelopes)"));
a("zazzle.com");
a("www.zazzle.com");
a("tracks.www.zazzle.com");
a("*.zcache.com");

R = new RuleSet("Zen Internet");
R.rules.push(new Rule("^http://(?:www\\.)?zen\\.co\\.uk/", "https://www.zen.co.uk/"));
R.rules.push(new Rule("^http://order\\.zen\\.co\\.uk/", "https://order.zen.co.uk/"));
a("zen.co.uk");
a("order.zen.co.uk");
a("www.zen.co.uk");

R = new RuleSet("Zencoder (partial)");
R.rules.push(new Rule("^http://vjs\\.zencdn\\.net/", "https://vjs.zencdn.net/"));
a("vjs.zencdn.net");

R = new RuleSet("Zend (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?zend\\.com/", "https://www.zend.com/"));
R.rules.push(new Rule("^http://shop\\.zend\\.com/", "https://shop.zend.com/"));
R.rules.push(new Rule("^http://static\\.zend\\.com/shop/", "https://shop-zend.pantherssl.com/"));
R.rules.push(new Rule("^http://static\\.zend\\.com/", "https://static-zend.pantherssl.com/"));
a("zend.com");
a("*.zend.com");
a("*.shop.zend.com");

R = new RuleSet("Zendesk.com clients (partial)");
R.rules.push(new Rule("^http://support\\.voxer\\.com/(assets|generated|images|registration|system)/", "https://voxer.zendesk.com/$1/"));
a("support.voxer.com");

R = new RuleSet("Zendesk");
R.rules.push(new Rule("^http://cdn\\.zendesk\\.com/", "https://s3.amazonaws.com/zd-assets/"));
R.rules.push(new Rule("^http://([\\w\\-_]+\\.)zendesk\\.com/", "https://$1zendesk.com/"));
R.exclusions.push(new Exclusion("^http://video\\."));
a("zendesk.com");
a("*.zendesk.com");

R = new RuleSet("ZeniMax Media (partial)");
R.rules.push(new Rule("^http://(\\w+\\.)?bethsoft\\.com/", "https://$1bethsoft.com/"));
R.exclusions.push(new Exclusion("^http://(cdnstatic|support)\\."));
a("bethsoft.com");
a("*.bethsoft.com");

R = new RuleSet("Zero Robotics");
R.rules.push(new Rule("^http://(www\\.)?zerorobotics\\.org/", "https://$1zerorobotics.org/"));
a("zerorobotics.org");
a("*.zerorobotics.org");

R = new RuleSet("ZeroXX");
R.rules.push(new Rule("^http://(www\\.)?zeroxx\\.nl/", "https://$1zeroxx.nl/"));
a("zeroxx.nl");
a("www.zeroxx.nl");

R = new RuleSet("Ziff Davis (partial)");
R.rules.push(new Rule("^http://metrics\\.((?:extreme)tech|geek)\\.com/", "https://ziffdavis$1.122.2o7.net/"));
a("metrics.extremetech.com");
a("metrics.geek.com");

R = new RuleSet("Ziggo");
R.rules.push(new Rule("^http://(?:www\\.)?ziggo\\.(nl|com)/", "https://www.ziggo.$1/"));
a("*.ziggo.nl");
a("*.ziggo.com");

R = new RuleSet("Zillow (partial)");
R.rules.push(new Rule("^http://zillow\\.com/", "https://www.zillow.com/"));
R.rules.push(new Rule("^http://www\\.zillow\\.com/(mobile|static)/", "https://www.zillow.com/$1/"));
R.rules.push(new Rule("^http://photos(?:\\d)?\\.zillow\\.com/", "https://photos.zillow.com/"));
R.rules.push(new Rule("^http://(www\\.)?zillowstatic\\.com/", "https://$1zillowstatic.com/"));
a("zillow.com");
a("*.zillow.com");
a("zillowstatic.com");
a("www.zillowstatic.com");

R = new RuleSet("Zimbra (partial)");
R.rules.push(new Rule("^http://zimbra\\.com/", "https://www.zimbra.com/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.zimbra\\.com/", "https://$1.zimbra.com/"));
R.exclusions.push(new Exclusion("^http://files2\\."));
a("zimbra.com");
a("*.zimbra.com");

R = new RuleSet("Ziplist.com");
R.rules.push(new Rule("^http://(?:www\\.)?ziplist\\.com/", "https://www.ziplist.com/"));
a("ziplist.com");
a("www.ziplist.com");

R = new RuleSet("Zoho");
R.rules.push(new Rule("^http://(assist|business|chat|creator|discussions|docs|invoice|mail|meeting|notebook|personal|planner|projects|recruit|reports|people|search|share|sheet|show|wiki|writer|www)\\.zoho\\.com/", "https://$1.zoho.com/"));
R.rules.push(new Rule("^http://(\\w+)\\.zohostatic\\.com/", "https://$1.zohostatic.com/"));
a("*.zoho.com");
a("*.zohostatic.com");

R = new RuleSet("Zoomerang (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?zoomerang\\.com/Survey/((App_)?Themes/|TinyMCE\\.ashx|ZoomStatic/)", "https://www.zoomerang.com/Survey/$1"));
R.rules.push(new Rule("^http://static\\.zoomerang\\.com/", "https://static.zoomerang.com/"));
a("zoomerang.com");
a("static.zoomerang.com");
a("www.zoomerang.com");

R = new RuleSet("Zoosk.com");
R.rules.push(new Rule("^http://(?:www\\.)?zoosk\\.com/", "https://www.zoosk.com/"));
a("zoosk.com");
a("www.zoosk.com");

R = new RuleSet("Zopa (partial)");
R.rules.push(new Rule("^http://(?:uk\\.|www\\.)?zopa\\.com/", "https://uk.zopa.com/"));
a("zopa.com");
a("uk.zopa.com");
a("www.zopa.com");

R = new RuleSet("Zotero");
R.rules.push(new Rule("^http://zotero\\.org/", "https://www.zotero.org/"));
R.rules.push(new Rule("^http://(forums|www)\\.zotero\\.org/", "https://$1.zotero.org/"));
a("zotero.org");
a("forums.zotero.org");
a("www.zotero.org");

R = new RuleSet("Zscaler");
R.rules.push(new Rule("^http://www\\.zscaler\\.com/", "https://www.zscaler.com/"));
a("www.zscaler.com");

R = new RuleSet("allAfrica (partial)");
R.rules.push(new Rule("^http://(?:www\\.)?allafrica\\.com/(commerce/user/(manage|subscribe)|static)/", "https://allafrica.com/$1/"));
a("allafrica.com");
a("www.allafrica.com");

R = new RuleSet("btjunkie");
R.rules.push(new Rule("^http://dl\\.btjunkie\\.org/", "https://dl.btjunkie.org/"));
R.rules.push(new Rule("^https?://(?:www\\.)?btjunkie\\.org/", "https://btjunkie.org/"));
a("btjunkie.org");
a("www.btjunkie.org");
a("dl.btjunkie.org");

R = new RuleSet("comdirect bank");
R.rules.push(new Rule("^http://(?:www\\.)?comdirect\\.de/", "https://www.comdirect.de/"));
R.rules.push(new Rule("^http://kunde\\.comdirect\\.de/", "https://kunde.comdirect.de/"));
a("kunde.comdirect.de");
a("www.comdirect.de");
a("comdirect.de");

R = new RuleSet("divShare");
R.rules.push(new Rule("^http://(www\\.)?divshare\\.com/", "https://divshare.com/"));
a("divshare.com");
a("www.divshare.com");

R = new RuleSet("e-ShopBrokers");
R.rules.push(new Rule("^http://(www\\.)?eshopbrokers\\.co\\.uk/", "https://www.eshopbrokers.co.uk/"));
a("eshopbrokers.co.uk");
a("www.eshopbrokers.co.uk");

R = new RuleSet("eBid.net");
R.rules.push(new Rule("^http://([A-Za-z]+\\.)?ebid\\.net/", "https://$1ebid.net/"));
a("*.ebid.net");
a("ebid.net");

R = new RuleSet("eHarmony (partial)");
R.rules.push(new Rule("^http://eharmony\\.com/", "https://eharmony.com/"));
R.rules.push(new Rule("^http://([\\w\\-]+)\\.eharmony\\.com/", "https://$1eharmony.com/"));
R.exclusions.push(new Exclusion("^http://static\\.eharmony\\.com/"));
R.exclusions.push(new Exclusion("^http://(advice|photos)\\.eharmony\\.com/"));
a("eharmony.com");
a("*.eharmony.com");

R = new RuleSet("eigenLab");
R.rules.push(new Rule("^http://(www\\.)?eigenlab\\.org/", "https://eigenlab.org/"));
a("eigenlab.org");
a("www.eigenlab.org");

R = new RuleSet("go!Mokulele");
R.rules.push(new Rule("^http://(?:www\\.)?iflygo\\.com/", "https://www.iflygo.com/"));
a("iflygo.com");
a("www.iflygo.com");

R = new RuleSet("hi5");
R.rules.push(new Rule("^http://(?:www\\.)?hi5\\.com/", "https://www.hi5.com/"));
a("hi5.com");
a("www.hi5.com");

R = new RuleSet("iCarol");
R.rules.push(new Rule("^http://((webapp|www)\\.)?icarol\\.com/", "https://$1icarol.com/"));
a("icarol.com");
a("webapp.icarol.com");
a("www.icarol.com");

R = new RuleSet("iEntry (partial)");
R.rules.push(new Rule("^http://(www\\.)?ientry\\.com/", "https://$1ientry.com/"));
a("ientry.com");
a("www.ientry.com");

R = new RuleSet("iPerceptions (partial)");
R.rules.push(new Rule("^http://(aiportal|(4qinvite\\.4q)|ipinvite|ips-invite|ips-portal)\\.iperceptions\\.com/", "https://$1.iperceptions.com/"));
a("aiportal.iperceptions.com");
a("4qinvite.4q.iperceptions.com");
a("ipinvite.iperceptions.com");
a("ips-invite.iperceptions.com");
a("ips-portal.iperceptions.com");

R = new RuleSet("netzclub");
R.rules.push(new Rule("^http://(?:www\\.)?netzclub\\.net/", "https://www.netzclub.net/"));
R.rules.push(new Rule("^http://profil\\.netzclub\\.net/", "https://profil.netzclub.net/"));
a("netzclub.net");
a("www.netzclub.net");
a("profil.netzclub.net");

R = new RuleSet("openDesktop.org");
R.rules.push(new Rule("^http://(?:www\\.)?opendesktop\\.org/", "https://opendesktop.org/"));
R.rules.push(new Rule("^http://(?:static\\.|www\\.)?(?:arch|beryl|box|cli|compiz|debian|ede|gentoo|gnome|gtk|java|kde|linuxmint|maemo|qt|suse|ubuntu|xfce)-(?:apps|art|files|help|look|stuff|themes)\\.org/(ad|cometchat|comments|CONTENT|fancybox|img|styles|usermanager)/", "https://opendesktop.org/$1/"));
R.rules.push(new Rule("^http://(?:static\\.|www\\.)?(?:linux42|opentemplate)\\.org/(ad|cometchat|comments|CONTENT|fancybox|img|styles|usermanager)/", "https://opendesktop.org/$1/"));
R.rules.push(new Rule("^http://addons\\.videolan\\.org/(ad|cometchat|comments|CONTENT|fancybox|img|styles|usermanager)/", "https://opendesktop.org/$1/"));
a("arch-stuff.org");
a("*.arch-stuff.org");
a("beryl-themes.org");
a("*.beryl-themes.org");
a("box-look.org");
a("*.box-look.org");
a("cli-apps.org");
a("*.cli-apps.org");
a("debian-art.org");
a("*.debian-art.org");
a("ede-look.org");
a("*.ede-look.org");
a("gentoo-art.org");
a("*.gentoo-art.org");
a("gnome-help.org");
a("www.gnome-help.org");
a("gnome-look.org");
a("www.gnome-look.org");
a("gtk-apps.org");
a("*.gtk-apps.org");
a("java-apps.org");
a("*.java-apps.org");
a("kde-apps.org");
a("*.kde-apps.org");
a("kde-files.org");
a("www.kde-files.org");
a("kde-help.org");
a("www.kde-help.org");
a("kde-look.org");
a("www.kde-look.org");
a("linux42.org");
a("*.linux42.org");
a("linuxmint-art.org");
a("*.linuxmint-art.org");
a("maemo-apps.org");
a("*.maemo-apps.org");
a("opendesktop.org");
a("www.opendesktop.org");
a("opentemplate.org");
a("*.opentemplate.org");
a("qt-apps.org");
a("www.qt-apps.org");
a("suse-art.org");
a("*.suse-art.org");
a("ubuntu-art.org");
a("*.ubuntu-art.org");
a("addons.videolan.org");
a("xfce-help.org");
a("www.xfce-help.org");
a("xfce-look.org");
a("www.xfce-look.org");

R = new RuleSet("schokokeks.org");
R.rules.push(new Rule("^http://(bugs|config|keys|webmail|wiki)\\.schokokeks\\.org/", "https://$1.schokokeks.org/"));
a("bugs.schokokeks.org");
a("config.schokokeks.org");
a("keys.schokokeks.org");
a("webmail.schokokeks.org");
a("wiki.schokokeks.org");

R = new RuleSet("so36.NET");
R.rules.push(new Rule("^http://so36\\.net/", "https://so36.net/"));
R.rules.push(new Rule("^http://([^/:@\\.]+)\\.so36\\.net/", "https://$1.so36.net/"));
a("so36.net");
a("*.so36.net");

R = new RuleSet("sysprovide (partial)");
R.rules.push(new Rule("^http://srv(\\d\\d)\\.sysproserver\\.de/", "https://srv$1.sysproserver.de/"));
R.rules.push(new Rule("^http://(www\\.)?sysprovide\\.de/", "https://$1sysprovide.de/"));
a("*.sysproserver.de");
a("sysprovide.de");
a("www.sysprovide.de");

R = new RuleSet("tn123.org");
R.rules.push(new Rule("^http://(www\\.)?tn123\\.org/", "https://$1tn123.org/"));
a("tn123.org");
a("www.tn123.org");

R = new RuleSet("vhf (partial)");
R.rules.push(new Rule("^http://shop\\.vhf\\.de/", "https://shop.vhf.de/"));
a("shop.vhf.de");

R = new RuleSet("walkit.com");
R.rules.push(new Rule("^http://(www\\.)?walkit\\.com/", "https://walkit.com/"));
a("walkit.com");
a("www.walkit.com");

R = new RuleSet("xServers");
R.rules.push(new Rule("^http://(?:www\\.)?xservers\\.ro/", "https://xservers.ro/"));
a("xservers.ro");
a("www.xservers.ro");

R = new RuleSet("xkcd");
R.rules.push(new Rule("^http://(www\\.|m\\.)?xkcd\\.(?:com|org)/", "https://$1xkcd.com/"));
R.rules.push(new Rule("^http://(?:www\\.)?store\\.xkcd\\.com/", "https://store.xkcd.com/"));
a("xkcd.com");
a("xkcd.org");
a("*.xkcd.com");
a("*.xkcd.org");
a("www.store.xkcd.com");

R = new RuleSet("yfrog");
R.rules.push(new Rule("^http://(?:www\\.)?yfrog\\.com/", "https://yfrog.com/"));
a("yfrog.com");
a("www.yfrog.com");

