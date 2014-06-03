class Settings < Settingslogic
    source "#{Rails.root}/config/app.yml"
    namespace Rails.env
end
